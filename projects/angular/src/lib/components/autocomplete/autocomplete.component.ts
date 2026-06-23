import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  Directive,
  ElementRef,
  inject,
  input,
  model,
  output,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

/**
 * A single suggestion rendered by {@link AfAutocompleteComponent}.
 *
 * The component never filters or sorts these — the consumer supplies the
 * already-resolved, display-ordered list (remote search, client cache, …).
 * `id` is the stable identity used for tracking and DOM ids; `value` is the
 * payload handed back on selection.
 */
export interface AfAutocompleteOption<T = unknown> {
  /** Stable identity — used for `@for` tracking and the option's DOM id. */
  id: string;
  /** Payload emitted via {@link AfAutocompleteComponent.optionSelected}. */
  value: T;
  /** Primary text — the accessible name and the default visual label. */
  label: string;
  /** Optional secondary text shown beneath the label in the default row. */
  description?: string;
  /**
   * Optional group key. Consecutive options sharing a key render under one
   * heading (see {@link AfAutocompleteComponent.groupLabels}). Omit for
   * ungrouped options.
   */
  group?: string;
  /** When true the option is shown but cannot be highlighted or selected. */
  disabled?: boolean;
}

/** Template context exposed to a custom option template. */
export interface AfAutocompleteOptionContext {
  /** The option being rendered (also available as the implicit value). */
  $implicit: AfAutocompleteOption;
  /** Same as {@link $implicit}; named for readable `let-option="option"`. */
  option: AfAutocompleteOption;
  /** The current query text, e.g. for highlighting matched substrings. */
  query: string;
}

/**
 * Marks an `<ng-template>` as the custom row renderer for
 * {@link AfAutocompleteComponent}. Without it the component falls back to
 * rendering `label` + `description`.
 *
 * @example
 * <af-autocomplete [options]="opts">
 *   <ng-template afAutocompleteOption let-option="option">
 *     <af-avatar [name]="option.label" />
 *     {{ option.label }}
 *   </ng-template>
 * </af-autocomplete>
 */
@Directive({ selector: 'ng-template[afAutocompleteOption]' })
export class AfAutocompleteOptionDirective {
  readonly template = inject<TemplateRef<AfAutocompleteOptionContext>>(TemplateRef);
}

/** Internal: an option paired with its flat index across all groups. */
interface IndexedOption {
  option: AfAutocompleteOption;
  flatIndex: number;
}

/** Internal: a rendered group (label `undefined` => ungrouped, no heading). */
interface DisplayGroup {
  key: string;
  label: string | undefined;
  items: IndexedOption[];
}

/**
 * Accessible async / remote autocomplete (typeahead) following the WAI-ARIA 1.2
 * combobox-with-listbox pattern.
 *
 * Unlike {@link AfComboboxComponent} — which owns a static option list and
 * filters it by label substring — this component is **external-filter only**:
 * the consumer owns fetching and filtering, then feeds the resolved results in
 * via `options` (and toggles `loading`). That makes it suitable for remote
 * search across multiple sources, where a hit may have matched on a field that
 * is not part of its visible label (e.g. a user matched by e-mail).
 *
 * It emits a selection **event** rather than binding a value, so the same box
 * can drive an action (apply a filter, navigate) while keeping the free text.
 *
 * Features: option groups with headings, a loading row, an empty row, rich
 * rows via {@link AfAutocompleteOptionDirective}, full keyboard support
 * (Arrow/Home/End/Enter/Escape/Tab) and screen-reader announcements.
 *
 * @example
 * <af-autocomplete
 *   label="Search"
 *   [(query)]="query"
 *   [options]="results()"
 *   [loading]="loading()"
 *   [minChars]="2"
 *   clearQueryOnSelect
 *   (optionSelected)="apply($event)"
 * >
 *   <ng-template afAutocompleteOption let-option="option">…</ng-template>
 * </af-autocomplete>
 */
@Component({
  selector: 'af-autocomplete',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
  template: `
    <div class="ct-field" [class.ct-field--error]="error()">
      @if (label()) {
        <label class="ct-field__label" [attr.for]="inputId">
          {{ label() }}
          @if (required()) {
            <span aria-label="required"> *</span>
          }
        </label>
      }

      <div [class]="rootClasses()" [attr.data-state]="panelOpen() ? 'open' : 'closed'">
        <div class="ct-autocomplete__input-wrap">
          @if (showSearchIcon()) {
            <span class="ct-autocomplete__leading" aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5" />
                <path
                  d="M10.5 10.5L14 14"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </span>
          }
          <input
            #inputEl
            class="ct-autocomplete__input"
            [class.ct-autocomplete__input--with-leading]="showSearchIcon()"
            [id]="inputId"
            type="text"
            role="combobox"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            [attr.aria-expanded]="panelOpen()"
            [attr.aria-controls]="listboxId"
            aria-autocomplete="list"
            [attr.aria-activedescendant]="activeDescendantId()"
            [attr.aria-invalid]="error() ? true : null"
            [attr.aria-describedby]="ariaDescribedBy()"
            [attr.aria-busy]="loading() || null"
            [attr.aria-required]="required() || null"
            [placeholder]="placeholder()"
            [disabled]="disabled()"
            [value]="query()"
            (input)="onInput($event)"
            (focus)="onFocus()"
            (keydown)="onKeydown($event)"
          />

          @if (loading()) {
            <span class="ct-autocomplete__spinner" aria-hidden="true"></span>
          } @else if (showClear() && query()) {
            <button
              type="button"
              class="ct-autocomplete__clear"
              [attr.aria-label]="clearAriaLabel()"
              (click)="clear()"
              (mousedown)="$event.preventDefault()"
            >
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M4 4l8 8M12 4l-8 8"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          }
        </div>

        <div
          #listboxEl
          [id]="listboxId"
          class="ct-autocomplete__listbox"
          role="listbox"
          [attr.aria-label]="label() || placeholder() || 'Suggestions'"
          [attr.aria-busy]="loading() || null"
        >
          @if (panelOpen()) {
            @for (group of displayGroups(); track group.key; let gi = $index) {
              @if (group.label) {
                <div
                  class="ct-autocomplete__group"
                  role="group"
                  [attr.aria-labelledby]="groupLabelId(gi)"
                >
                  <div class="ct-autocomplete__group-label" [id]="groupLabelId(gi)">
                    {{ group.label }}
                  </div>
                  @for (item of group.items; track item.option.id) {
                    <ng-container
                      [ngTemplateOutlet]="optionRow"
                      [ngTemplateOutletContext]="{ $implicit: item }"
                    />
                  }
                </div>
              } @else {
                @for (item of group.items; track item.option.id) {
                  <ng-container
                    [ngTemplateOutlet]="optionRow"
                    [ngTemplateOutletContext]="{ $implicit: item }"
                  />
                }
              }
            }

            @if (loading()) {
              <div class="ct-autocomplete__loading" role="presentation">
                <span class="ct-autocomplete__spinner" aria-hidden="true"></span>
                {{ loadingText() }}
              </div>
            } @else if (showEmpty()) {
              <div class="ct-autocomplete__empty" role="presentation">{{ emptyText() }}</div>
            }
          }
        </div>

        <div class="ct-autocomplete__status" role="status" aria-live="polite" aria-atomic="true">
          {{ statusMessage() }}
        </div>
      </div>

      @if (hint() && !error()) {
        <div class="ct-field__hint" [id]="hintId">{{ hint() }}</div>
      }
      @if (error()) {
        <div class="ct-field__error" role="alert" [id]="errorId">{{ error() }}</div>
      }
    </div>

    <ng-template #optionRow let-item>
      <div
        class="ct-autocomplete__option"
        role="option"
        [id]="optionDomId(item.flatIndex)"
        [attr.aria-selected]="highlightedIndex() === item.flatIndex"
        [attr.aria-disabled]="item.option.disabled || null"
        [attr.data-highlighted]="highlightedIndex() === item.flatIndex ? '' : null"
        (click)="selectOption(item.option)"
        (mouseenter)="highlightedIndex.set(item.flatIndex)"
        (mousedown)="$event.preventDefault()"
      >
        @if (optionTemplate(); as tpl) {
          <ng-container
            [ngTemplateOutlet]="tpl.template"
            [ngTemplateOutletContext]="{
              $implicit: item.option,
              option: item.option,
              query: query(),
            }"
          />
        } @else {
          <span class="ct-autocomplete__option-label">{{ item.option.label }}</span>
          @if (item.option.description) {
            <span class="ct-autocomplete__option-description">{{ item.option.description }}</span>
          }
        }
      </div>
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .ct-autocomplete {
        --ct-ac-height: var(--control-height-md);
        --ct-ac-font-size: var(--font-size-md);
        --ct-ac-line-height: var(--line-height-md);
        --ct-ac-padding-x: var(--space-5);
        --ct-ac-option-padding-x: var(--space-4);
        --ct-ac-option-padding-y: var(--space-3);
        --ct-ac-listbox-max-height: 320px;

        position: relative;
        display: flex;
        flex-direction: column;
        width: 100%;
      }

      .ct-autocomplete--sm {
        --ct-ac-height: var(--control-height-sm);
        --ct-ac-font-size: var(--font-size-sm);
        --ct-ac-line-height: var(--line-height-sm);
        --ct-ac-padding-x: var(--space-4);
        --ct-ac-option-padding-y: var(--space-2);
      }

      .ct-autocomplete--lg {
        --ct-ac-height: var(--control-height-lg);
        --ct-ac-font-size: var(--font-size-lg);
        --ct-ac-line-height: var(--line-height-lg);
        --ct-ac-padding-x: var(--space-6);
        --ct-ac-option-padding-y: var(--space-4);
      }

      .ct-autocomplete__input-wrap {
        position: relative;
        display: flex;
        align-items: center;
      }

      .ct-autocomplete__leading {
        position: absolute;
        inset-inline-start: var(--ct-ac-padding-x);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--color-text-muted);
        pointer-events: none;
      }

      .ct-autocomplete__leading svg {
        width: var(--icon-sm, 1rem);
        height: var(--icon-sm, 1rem);
      }

      .ct-autocomplete__input {
        width: 100%;
        height: var(--ct-ac-height);
        padding: 0 var(--ct-ac-padding-x);
        padding-inline-end: calc(var(--ct-ac-padding-x) + var(--icon-md, 1.25rem) + var(--space-2));
        border: var(--border-thin) solid var(--ct-control-border);
        border-radius: var(--ct-control-radius);
        background: var(--ct-control-bg);
        color: var(--ct-control-text);
        font-size: var(--ct-ac-font-size);
        line-height: var(--ct-ac-line-height);
        transition: var(--ct-control-transition);
      }

      .ct-autocomplete__input--with-leading {
        padding-inline-start: calc(var(--ct-ac-padding-x) + var(--icon-sm, 1rem) + var(--space-2));
      }

      .ct-autocomplete__input::placeholder {
        color: var(--ct-control-placeholder);
      }

      @media (hover: hover) {
        .ct-autocomplete__input:hover {
          border-color: var(--ct-control-border-hover);
        }
      }

      .ct-autocomplete__input:focus-visible {
        border-color: var(--ct-control-border-focus);
        outline: 2px solid var(--color-focus-ring);
        outline-offset: -1px;
      }

      .ct-autocomplete__input:disabled {
        background: var(--ct-control-bg-disabled);
        border-color: var(--color-border-subtle);
        color: var(--color-text-muted);
        pointer-events: none;
      }

      .ct-autocomplete__input[aria-invalid='true'] {
        border-color: var(--color-state-danger);
      }

      .ct-autocomplete__input[aria-invalid='true']:focus-visible {
        outline-color: var(--color-state-danger);
      }

      .ct-autocomplete__clear {
        appearance: none;
        position: absolute;
        inset-inline-end: var(--space-2);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: var(--icon-lg, 1.5rem);
        height: var(--icon-lg, 1.5rem);
        padding: 0;
        border: none;
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--color-text-muted);
        cursor: pointer;
        transition:
          color var(--duration-fast) var(--easing-standard),
          background var(--duration-fast) var(--easing-standard);
      }

      .ct-autocomplete__clear svg {
        width: var(--icon-sm, 1rem);
        height: var(--icon-sm, 1rem);
      }

      @media (hover: hover) {
        .ct-autocomplete__clear:hover {
          color: var(--color-text-secondary);
          background: var(--color-bg-muted);
        }
      }

      .ct-autocomplete__clear:focus-visible {
        outline: 2px solid var(--color-focus-ring);
        outline-offset: 1px;
      }

      .ct-autocomplete__spinner {
        position: absolute;
        inset-inline-end: var(--space-4);
        width: var(--icon-sm, 1rem);
        height: var(--icon-sm, 1rem);
        border: 2px solid var(--color-border-subtle);
        border-top-color: var(--color-brand-primary);
        border-radius: var(--radius-full, 999px);
        animation: ct-ac-spin 0.6s linear infinite;
      }

      .ct-autocomplete__loading .ct-autocomplete__spinner,
      .ct-autocomplete__empty .ct-autocomplete__spinner {
        position: static;
        inset-inline-end: auto;
      }

      @keyframes ct-ac-spin {
        to {
          transform: rotate(360deg);
        }
      }

      .ct-autocomplete__listbox {
        position: absolute;
        inset-inline-start: 0;
        inset-inline-end: 0;
        inset-block-start: calc(100% + var(--space-2));
        z-index: var(--z-dropdown, 50);
        max-height: var(--ct-ac-listbox-max-height);
        overflow-y: auto;
        padding: var(--space-2);
        border-radius: var(--radius-md);
        border: var(--border-thin) solid var(--color-border-subtle);
        background: var(--color-bg-elevated);
        box-shadow: var(--shadow-dropdown);
        opacity: 0;
        visibility: hidden;
        transform: translateY(4px);
        transition:
          opacity var(--duration-fast) var(--easing-standard),
          transform var(--duration-fast) var(--easing-standard),
          visibility 0s linear var(--duration-fast);
      }

      .ct-autocomplete[data-state='open'] .ct-autocomplete__listbox {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
        transition:
          opacity var(--duration-fast) var(--easing-standard),
          transform var(--duration-fast) var(--easing-standard),
          visibility 0s linear 0s;
      }

      .ct-autocomplete__group + .ct-autocomplete__group {
        margin-top: var(--space-1);
        border-top: var(--border-thin) solid var(--color-border-subtle);
        padding-top: var(--space-1);
      }

      .ct-autocomplete__group-label {
        padding: var(--space-2) var(--ct-ac-option-padding-x);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: var(--letter-spacing-wide, 0.04em);
      }

      .ct-autocomplete__option {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--ct-ac-option-padding-y) var(--ct-ac-option-padding-x);
        border-radius: var(--radius-sm);
        color: var(--color-text-primary);
        font-size: var(--ct-ac-font-size);
        line-height: var(--ct-ac-line-height);
        cursor: pointer;
        transition: background var(--duration-fast) var(--easing-standard);
      }

      @media (hover: hover) {
        .ct-autocomplete__option:hover {
          background: var(--color-bg-muted);
        }
      }

      .ct-autocomplete__option[data-highlighted] {
        background: var(--color-bg-muted);
        outline: var(--border-medium) solid var(--color-brand-primary);
        outline-offset: -2px;
      }

      .ct-autocomplete__option[aria-disabled='true'] {
        opacity: var(--opacity-disabled, 0.5);
        pointer-events: none;
        cursor: not-allowed;
      }

      .ct-autocomplete__option-label {
        flex: 1;
        min-width: 0;
      }

      .ct-autocomplete__option-description {
        font-size: var(--font-size-xs);
        color: var(--color-text-muted);
      }

      .ct-autocomplete__empty,
      .ct-autocomplete__loading {
        padding: var(--space-6) var(--ct-ac-option-padding-x);
        text-align: center;
        color: var(--color-text-muted);
        font-size: var(--font-size-sm);
      }

      .ct-autocomplete__loading {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-3);
      }

      .ct-autocomplete__status {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        border: 0;
      }

      @media (prefers-reduced-motion: reduce) {
        .ct-autocomplete__listbox {
          transition: none;
        }
        .ct-autocomplete__spinner {
          animation-duration: 1.5s;
        }
      }
    `,
  ],
})
export class AfAutocompleteComponent {
  private static nextId = 0;

  /** Field label rendered above the input. */
  readonly label = input('');
  /** Placeholder text for the input. */
  readonly placeholder = input('');
  /** Hint text shown below the input (hidden while {@link error} is set). */
  readonly hint = input('');
  /** Error message — shows the error state and message. */
  readonly error = input('');
  /** Whether the field is required (renders the `*` indicator). */
  readonly required = input(false, { transform: booleanAttribute });
  /** Whether the input is disabled. */
  readonly disabled = model(false);
  /** Size variant. */
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  /**
   * The suggestions to display, already filtered and ordered by the consumer.
   * The component does not filter them.
   */
  readonly options = input<AfAutocompleteOption[]>([]);
  /** Shows the loading row / spinner while a fetch is in flight. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Minimum trimmed query length before the listbox opens. */
  readonly minChars = input(1);
  /** Text shown when a query is present but no options match. */
  readonly emptyText = input('No results found');
  /** Text shown in the loading row. */
  readonly loadingText = input('Searching…');
  /** Whether re-focusing the input re-opens the listbox. */
  readonly openOnFocus = input(true, { transform: booleanAttribute });
  /**
   * When true the panel stays closed while there are no options and no fetch
   * is in flight — instead of showing the empty row. Useful when the same box
   * also drives a side effect (e.g. a live text filter) so an empty suggestion
   * list should be silent rather than intrusive.
   */
  readonly hideOnEmpty = input(false, { transform: booleanAttribute });
  /** When true the query text is cleared after a selection (action-style use). */
  readonly clearQueryOnSelect = input(false, { transform: booleanAttribute });
  /** Render the leading search icon. */
  readonly showSearchIcon = input(true, { transform: booleanAttribute });
  /** Render the trailing clear (×) button when the query is non-empty. */
  readonly showClear = input(true, { transform: booleanAttribute });
  /** Accessible label for the clear button. */
  readonly clearAriaLabel = input('Clear search');
  /** Maps a group key to its display heading; falls back to the key itself. */
  readonly groupLabels = input<Record<string, string>>({});
  /** Explicit group ordering by key; unlisted keys keep first-seen order. */
  readonly groupOrder = input<string[]>([]);
  /** Unique base id for the field's `id`/`aria` wiring. */
  readonly autocompleteId = input(`af-autocomplete-${AfAutocompleteComponent.nextId++}`);

  /** Two-way bound query text. The consumer debounces this and feeds `options`. */
  readonly query = model('');

  /** Emitted when the user selects an enabled option. */
  readonly optionSelected = output<AfAutocompleteOption>();

  protected readonly optionTemplate = contentChild(AfAutocompleteOptionDirective);
  protected readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('inputEl');

  protected readonly isOpen = signal(false);
  protected readonly highlightedIndex = signal(-1);

  get inputId(): string {
    return `${this.autocompleteId()}-input`;
  }
  get listboxId(): string {
    return `${this.autocompleteId()}-listbox`;
  }
  get hintId(): string {
    return `${this.autocompleteId()}-hint`;
  }
  get errorId(): string {
    return `${this.autocompleteId()}-error`;
  }

  protected readonly rootClasses = computed(() => {
    const classes = ['ct-autocomplete'];
    const s = this.size();
    if (s === 'sm') classes.push('ct-autocomplete--sm');
    if (s === 'lg') classes.push('ct-autocomplete--lg');
    return classes.join(' ');
  });

  /** True once the trimmed query reaches {@link minChars}. */
  protected readonly hasMinChars = computed(() => this.query().trim().length >= this.minChars());

  /** Flat, display-ordered options used for keyboard navigation. */
  protected readonly flatOptions = computed(() => this.options());

  /** Options grouped for rendering, each paired with its flat index. */
  protected readonly displayGroups = computed<DisplayGroup[]>(() => {
    const order = this.groupOrder();
    const labels = this.groupLabels();
    const groups = new Map<string, DisplayGroup>();
    this.options().forEach((option, flatIndex) => {
      const key = option.group ?? '';
      let group = groups.get(key);
      if (!group) {
        group = { key, label: key ? (labels[key] ?? key) : undefined, items: [] };
        groups.set(key, group);
      }
      group.items.push({ option, flatIndex });
    });
    const result = [...groups.values()];
    if (order.length > 0) {
      result.sort((a, b) => {
        const ia = order.indexOf(a.key);
        const ib = order.indexOf(b.key);
        return (ia === -1 ? order.length : ia) - (ib === -1 ? order.length : ib);
      });
    }
    return result;
  });

  /** Whether the listbox is visually open. */
  protected readonly panelOpen = computed(() => {
    if (!this.isOpen() || !this.hasMinChars()) return false;
    if (this.hideOnEmpty() && !this.loading() && this.flatOptions().length === 0) return false;
    return true;
  });

  /** Whether to render the "no results" row. */
  protected readonly showEmpty = computed(
    () => !this.loading() && this.flatOptions().length === 0 && this.hasMinChars(),
  );

  protected readonly activeDescendantId = computed(() => {
    const idx = this.highlightedIndex();
    if (!this.panelOpen() || idx < 0 || idx >= this.flatOptions().length) return null;
    return this.optionDomId(idx);
  });

  protected readonly statusMessage = computed(() => {
    if (!this.panelOpen()) return '';
    if (this.loading()) return this.loadingText();
    const count = this.flatOptions().length;
    if (count === 0) return this.emptyText();
    return `${count} result${count === 1 ? '' : 's'} available`;
  });

  protected ariaDescribedBy(): string | null {
    if (this.error()) return this.errorId;
    if (this.hint()) return this.hintId;
    return null;
  }

  protected optionDomId(flatIndex: number): string {
    return `${this.autocompleteId()}-option-${flatIndex}`;
  }

  protected groupLabelId(groupIndex: number): string {
    return `${this.autocompleteId()}-group-${groupIndex}`;
  }

  protected onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
    // Manual-selection pattern (WAI-ARIA APG): keep nothing highlighted until
    // the user navigates, so a free-text Enter never hijacks into a selection.
    this.highlightedIndex.set(-1);
    this.isOpen.set(value.trim().length >= this.minChars());
  }

  protected onFocus(): void {
    if (this.openOnFocus() && this.hasMinChars()) {
      this.isOpen.set(true);
    }
  }

  /** Selects an enabled option: emits it, then clears or restores the text. */
  selectOption(option: AfAutocompleteOption): void {
    if (option.disabled) return;
    this.optionSelected.emit(option);
    this.query.set(this.clearQueryOnSelect() ? '' : option.label);
    this.close();
    this.inputRef()?.nativeElement.focus();
  }

  /** Clears the query text and closes the listbox. */
  clear(): void {
    this.query.set('');
    this.close();
    this.inputRef()?.nativeElement.focus();
  }

  /** Closes the listbox without changing the query. */
  close(): void {
    this.isOpen.set(false);
    this.highlightedIndex.set(-1);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const options = this.flatOptions();
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.panelOpen()) {
          this.isOpen.set(true);
          this.highlightedIndex.set(this.firstEnabledIndex());
        } else {
          this.moveHighlight(1);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!this.panelOpen()) {
          this.isOpen.set(true);
          this.highlightedIndex.set(this.lastEnabledIndex());
        } else {
          this.moveHighlight(-1);
        }
        break;
      case 'Enter': {
        const idx = this.highlightedIndex();
        if (this.panelOpen() && idx >= 0 && idx < options.length && !options[idx].disabled) {
          event.preventDefault();
          this.selectOption(options[idx]);
        }
        break;
      }
      case 'Escape':
        if (this.panelOpen()) {
          event.preventDefault();
          this.close();
        }
        break;
      case 'Home':
        if (this.panelOpen()) {
          event.preventDefault();
          this.highlightedIndex.set(this.firstEnabledIndex());
          this.scrollHighlightedIntoView();
        }
        break;
      case 'End':
        if (this.panelOpen()) {
          event.preventDefault();
          this.highlightedIndex.set(this.lastEnabledIndex());
          this.scrollHighlightedIntoView();
        }
        break;
      case 'Tab':
        if (this.panelOpen()) {
          const idx = this.highlightedIndex();
          if (idx >= 0 && idx < options.length && !options[idx].disabled) {
            this.selectOption(options[idx]);
          }
          this.close();
        }
        break;
    }
  }

  protected onDocumentClick(event: MouseEvent): void {
    const host = this.inputRef()?.nativeElement.closest('.ct-autocomplete');
    if (host && !host.contains(event.target as Node)) {
      this.close();
    }
  }

  private moveHighlight(direction: number): void {
    const options = this.flatOptions();
    if (options.length === 0) return;
    let idx = this.highlightedIndex();
    let attempts = 0;
    do {
      idx += direction;
      if (idx < 0) idx = options.length - 1;
      if (idx >= options.length) idx = 0;
      attempts++;
    } while (options[idx]?.disabled && attempts <= options.length);
    if (!options[idx]?.disabled) {
      this.highlightedIndex.set(idx);
      this.scrollHighlightedIntoView();
    }
  }

  private firstEnabledIndex(): number {
    return this.flatOptions().findIndex((o) => !o.disabled);
  }

  private lastEnabledIndex(): number {
    const options = this.flatOptions();
    for (let i = options.length - 1; i >= 0; i--) {
      if (!options[i].disabled) return i;
    }
    return -1;
  }

  private scrollHighlightedIntoView(): void {
    queueMicrotask(() => {
      const host = this.inputRef()?.nativeElement.closest('.ct-autocomplete');
      const optionEl = host?.querySelector('[data-highlighted]') as HTMLElement | null;
      optionEl?.scrollIntoView?.({ block: 'nearest' });
    });
  }
}

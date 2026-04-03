import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  computed,
  forwardRef,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AriaLiveAnnouncer } from '../../utils/aria-live-announcer';
import { AF_SELECT_MENU_I18N } from './select-menu.i18n';

export interface AfSelectMenuOption {
  value: unknown;
  label: string;
  disabled?: boolean;
}

/**
 * Custom dropdown select component with keyboard navigation
 * and full ARIA listbox pattern for single and multi-select.
 *
 * @example Single select
 * <af-select-menu
 *   label="Country"
 *   placeholder="Select a country"
 *   [options]="countries"
 *   [(ngModel)]="selectedCountry">
 * </af-select-menu>
 *
 * @example Multi-select with reactive forms
 * <af-select-menu
 *   label="Roles"
 *   placeholder="Select roles"
 *   [options]="roles"
 *   [multiple]="true"
 *   [formControl]="rolesControl">
 * </af-select-menu>
 *
 * @accessibility
 * - Implements the WAI-ARIA Listbox pattern with a combobox trigger.
 * - Keyboard: ArrowDown/Up to move highlight, Enter/Space to select,
 *   Escape to close, Home/End to jump, Tab to select-and-close (single) or close (multi).
 * - Focus stays on the combobox trigger; `aria-activedescendant` tracks the highlighted option.
 * - Screen-reader announcements via {@link AriaLiveAnnouncer} for open/close/selection changes.
 * - All user-facing strings are configurable via {@link AF_SELECT_MENU_I18N} for i18n.
 * - Uses CSS logical properties for RTL layout support.
 * - `aria-describedby` links to hint or error text; `aria-invalid` is set on error state.
 * - Disabled options are marked with `aria-disabled` and skipped during keyboard navigation.
 */
@Component({
  selector: 'af-select-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AfSelectMenuComponent),
      multi: true,
    },
  ],
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
  template: `
    <div class="ct-field" [class.ct-field--error]="error()">
      @if (label()) {
        <label class="ct-field__label" [id]="labelId">
          {{ label() }}
          @if (required()) {
            <span aria-label="required"> *</span>
          }
        </label>
      }

      <div
        #menuEl
        [class]="menuClasses()"
        [attr.data-state]="isOpen() ? 'open' : 'closed'">
        <button
          #triggerEl
          class="ct-select-menu__trigger"
          type="button"
          role="combobox"
          [attr.aria-expanded]="isOpen()"
          aria-haspopup="listbox"
          [attr.aria-controls]="listboxId"
          [attr.aria-labelledby]="label() ? labelId : null"
          [attr.aria-label]="label() ? null : i18n.selectOption"
          [attr.aria-activedescendant]="activeDescendantId()"
          [attr.aria-invalid]="error() ? true : null"
          [attr.aria-describedby]="getAriaDescribedBy()"
          [attr.aria-required]="required() || null"
          [disabled]="disabled()"
          (click)="toggleListbox()"
          (keydown)="onKeydown($event)"
          (blur)="onBlur()">
          <span
            class="ct-select-menu__value"
            [attr.data-placeholder]="isPlaceholder() ? '' : null">
            {{ displayValue() }}
          </span>
          <span class="ct-select-menu__icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </button>

        <div
          #listboxEl
          [id]="listboxId"
          class="ct-select-menu__content"
          role="listbox"
          [attr.aria-labelledby]="label() ? labelId : null"
          [attr.aria-multiselectable]="multiple() || null"
          tabindex="-1">
          @for (option of options(); track option.value; let i = $index) {
            <div
              class="ct-select-menu__option"
              role="option"
              [id]="getOptionId(i)"
              [attr.aria-selected]="isSelected(option)"
              [attr.aria-disabled]="option.disabled || null"
              [attr.data-highlighted]="highlightedIndex() === i ? '' : null"
              (click)="selectOption(option)"
              (mouseenter)="highlightedIndex.set(i)"
              (mousedown)="$event.preventDefault()">
              <span class="ct-select-menu__option-check" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <span class="ct-select-menu__option-label">{{ option.label }}</span>
            </div>
          }
        </div>
      </div>

      @if (hint() && !error()) {
        <div class="ct-field__hint" [id]="hintId">{{ hint() }}</div>
      }

      @if (error()) {
        <div class="ct-field__error" [id]="errorId">{{ error() }}</div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class AfSelectMenuComponent implements ControlValueAccessor {
  private static nextId = 0;
  protected readonly i18n = inject(AF_SELECT_MENU_I18N);
  private readonly announcer = inject(AriaLiveAnnouncer);

  /** Label shown above the select */
  label = input('');

  /** Placeholder text when nothing is selected */
  placeholder = input('');

  /** Available options */
  options = input<AfSelectMenuOption[]>([]);

  /** Hint text shown below the select */
  hint = input('');

  /** Error message — shows error state */
  error = input('');

  /** Whether the field is required */
  required = input(false);

  /** Whether the component is disabled */
  disabled = model(false);

  /** Allow selecting multiple options */
  multiple = input(false);

  /** Size variant */
  size = input<'sm' | 'md' | 'lg'>('md');

  /** Value comparison function for object values */
  compareWith = input<(a: unknown, b: unknown) => boolean>((a, b) => a === b);

  /** Unique component ID */
  componentId = input(`af-select-menu-${AfSelectMenuComponent.nextId++}`);

  triggerRef = viewChild<ElementRef<HTMLButtonElement>>('triggerEl');
  listboxRef = viewChild<ElementRef<HTMLDivElement>>('listboxEl');
  menuRef = viewChild<ElementRef<HTMLDivElement>>('menuEl');

  isOpen = signal(false);
  highlightedIndex = signal(-1);
  private value = signal<unknown>(null);

  private onChange: (value: unknown) => void = () => {};
  private onTouchedCallback: () => void = () => {};

  get labelId(): string {
    return `${this.componentId()}-label`;
  }

  get listboxId(): string {
    return `${this.componentId()}-listbox`;
  }

  get hintId(): string {
    return `${this.componentId()}-hint`;
  }

  get errorId(): string {
    return `${this.componentId()}-error`;
  }

  menuClasses = computed(() => {
    const classes = ['ct-select-menu'];
    const s = this.size();
    if (s === 'sm') classes.push('ct-select-menu--sm');
    if (s === 'lg') classes.push('ct-select-menu--lg');
    return classes.join(' ');
  });

  isPlaceholder = computed(() => {
    const v = this.value();
    if (this.multiple()) {
      return ((v as unknown[]) ?? []).length === 0;
    }
    return v === null || v === undefined;
  });

  displayValue = computed(() => {
    const v = this.value();
    const opts = this.options();
    const cmp = this.compareWith();

    if (this.multiple()) {
      const vals = (v as unknown[]) ?? [];
      if (vals.length === 0) return this.placeholder();
      return vals
        .map((val) => opts.find((o) => cmp(o.value, val))?.label)
        .filter(Boolean)
        .join(', ');
    }

    if (v === null || v === undefined) return this.placeholder();
    return opts.find((o) => cmp(o.value, v))?.label ?? this.placeholder();
  });

  activeDescendantId = computed(() => {
    const idx = this.highlightedIndex();
    if (idx < 0 || idx >= this.options().length) return null;
    return this.getOptionId(idx);
  });

  getAriaDescribedBy(): string | null {
    if (this.error()) return this.errorId;
    if (this.hint()) return this.hintId;
    return null;
  }

  getOptionId(index: number): string {
    return `${this.componentId()}-option-${index}`;
  }

  isSelected(option: AfSelectMenuOption): boolean {
    const v = this.value();
    const cmp = this.compareWith();
    if (this.multiple()) {
      return ((v as unknown[]) ?? []).some((val) => cmp(val, option.value));
    }
    if (v === null || v === undefined) return false;
    return cmp(v, option.value);
  }

  /** Toggles the listbox open/closed */
  toggleListbox(): void {
    if (this.isOpen()) {
      this.closeListbox();
    } else {
      this.openListbox();
    }
  }

  /** Opens the listbox and highlights the selected or first enabled option */
  openListbox(): void {
    if (this.disabled() || this.isOpen()) return;
    this.isOpen.set(true);
    this.highlightedIndex.set(this.findSelectedOrFirstIndex());
    this.scrollHighlightedIntoView();

    const enabledCount = this.options().filter((o) => !o.disabled).length;
    this.announcer.announce(
      this.i18n.opened.replace('{count}', String(enabledCount)),
    );
  }

  /** Closes the listbox */
  closeListbox(): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.highlightedIndex.set(-1);
    this.announcer.announce(this.i18n.closed);
  }

  /** Selects or toggles an option */
  selectOption(option: AfSelectMenuOption): void {
    if (option.disabled) return;

    const cmp = this.compareWith();

    if (this.multiple()) {
      const current = (this.value() as unknown[]) ?? [];
      const idx = current.findIndex((v) => cmp(v, option.value));
      const wasSelected = idx >= 0;
      const next = wasSelected
        ? [...current.slice(0, idx), ...current.slice(idx + 1)]
        : [...current, option.value];
      this.value.set(next);
      this.onChange(next);

      const msg = wasSelected
        ? this.i18n.deselected.replace('{label}', option.label)
        : this.i18n.selected.replace('{label}', option.label);
      this.announcer.announce(
        `${msg}, ${this.i18n.countSelected.replace('{count}', String(next.length))}`,
      );
    } else {
      this.value.set(option.value);
      this.onChange(option.value);
      this.announcer.announce(this.i18n.selected.replace('{label}', option.label));
      this.closeListbox();
      this.triggerRef()?.nativeElement.focus();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    const opts = this.options();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen()) {
          this.openListbox();
          return;
        }
        this.moveHighlight(1);
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (!this.isOpen()) {
          this.openListbox();
          return;
        }
        this.moveHighlight(-1);
        break;

      case 'Enter':
      case ' ':
        if (this.isOpen()) {
          event.preventDefault();
          const idx = this.highlightedIndex();
          if (idx >= 0 && idx < opts.length && !opts[idx].disabled) {
            this.selectOption(opts[idx]);
          }
        } else {
          event.preventDefault();
          this.openListbox();
        }
        break;

      case 'Escape':
        if (this.isOpen()) {
          event.preventDefault();
          this.closeListbox();
          this.triggerRef()?.nativeElement.focus();
        }
        break;

      case 'Home':
        if (this.isOpen()) {
          event.preventDefault();
          this.highlightedIndex.set(this.findFirstEnabledIndex());
          this.scrollHighlightedIntoView();
        }
        break;

      case 'End':
        if (this.isOpen()) {
          event.preventDefault();
          this.highlightedIndex.set(this.findLastEnabledIndex());
          this.scrollHighlightedIntoView();
        }
        break;

      case 'Tab':
        if (this.isOpen()) {
          if (!this.multiple()) {
            const idx = this.highlightedIndex();
            if (idx >= 0 && idx < opts.length && !opts[idx].disabled) {
              this.selectOption(opts[idx]);
            }
          }
          this.closeListbox();
        }
        break;
    }
  }

  onBlur(): void {
    this.closeListbox();
    this.onTouchedCallback();
  }

  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen()) return;
    const target = event.target as HTMLElement;
    const menu = this.menuRef()?.nativeElement;
    if (menu && !menu.contains(target)) {
      this.closeListbox();
      this.onTouchedCallback();
    }
  }

  writeValue(value: unknown): void {
    if (this.multiple()) {
      this.value.set(Array.isArray(value) ? value : []);
    } else {
      this.value.set(value ?? null);
    }
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedCallback = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  private moveHighlight(direction: number): void {
    const opts = this.options();
    if (opts.length === 0) return;

    let idx = this.highlightedIndex();
    let attempts = 0;

    do {
      idx += direction;
      if (idx < 0) idx = opts.length - 1;
      if (idx >= opts.length) idx = 0;
      attempts++;
    } while (opts[idx]?.disabled && attempts < opts.length);

    if (!opts[idx]?.disabled) {
      this.highlightedIndex.set(idx);
      this.scrollHighlightedIntoView();
    }
  }

  private scrollHighlightedIntoView(): void {
    queueMicrotask(() => {
      const listbox = this.listboxRef()?.nativeElement;
      if (!listbox) return;
      const el = listbox.querySelector('[data-highlighted]') as HTMLElement;
      el?.scrollIntoView?.({ block: 'nearest' });
    });
  }

  private findSelectedOrFirstIndex(): number {
    const v = this.value();
    const opts = this.options();
    const cmp = this.compareWith();

    if (this.multiple()) {
      const vals = (v as unknown[]) ?? [];
      if (vals.length > 0) {
        const idx = opts.findIndex((o) => cmp(o.value, vals[0]));
        if (idx >= 0 && !opts[idx].disabled) return idx;
      }
    } else if (v !== null && v !== undefined) {
      const idx = opts.findIndex((o) => cmp(o.value, v));
      if (idx >= 0) return idx;
    }

    return this.findFirstEnabledIndex();
  }

  private findFirstEnabledIndex(): number {
    return this.options().findIndex((o) => !o.disabled);
  }

  private findLastEnabledIndex(): number {
    const opts = this.options();
    for (let i = opts.length - 1; i >= 0; i--) {
      if (!opts[i].disabled) return i;
    }
    return -1;
  }
}

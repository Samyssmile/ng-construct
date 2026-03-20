import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  computed,
  forwardRef,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface AfComboboxOption {
  value: unknown;
  label: string;
  disabled?: boolean;
  description?: string;
}

/**
 * Combobox component with autocomplete filtering, keyboard navigation,
 * and full ARIA support following the WAI-ARIA 1.2 combobox pattern.
 *
 * @example
 * <af-combobox
 *   label="Country"
 *   placeholder="Search countries..."
 *   [options]="countries"
 *   [(ngModel)]="selectedCountry"
 *   hint="Start typing to filter"
 * ></af-combobox>
 *
 * @example
 * <af-combobox
 *   label="Assignee"
 *   [options]="teamMembers"
 *   [formControl]="assigneeControl"
 *   [error]="assigneeError"
 *   required
 * ></af-combobox>
 */
@Component({
  selector: 'af-combobox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AfComboboxComponent),
      multi: true,
    },
  ],
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

      <div
        [class]="comboboxClasses()"
        [attr.data-state]="isOpen() ? 'open' : 'closed'"
      >
        <div class="ct-combobox__input-wrap">
          <input
            #inputEl
            class="ct-combobox__input"
            [id]="inputId"
            type="text"
            role="combobox"
            autocomplete="off"
            [attr.aria-expanded]="isOpen()"
            [attr.aria-controls]="listboxId"
            aria-autocomplete="list"
            [attr.aria-activedescendant]="activeDescendantId()"
            [attr.aria-invalid]="error() ? true : null"
            [attr.aria-describedby]="getAriaDescribedBy()"
            [placeholder]="placeholder()"
            [disabled]="disabled()"
            [attr.aria-required]="required() || null"
            [value]="query()"
            (input)="onInput($event)"
            (focus)="onFocus()"
            (blur)="onBlur()"
            (keydown)="onKeydown($event)"
          />
          <button
            type="button"
            class="ct-combobox__trigger"
            tabindex="-1"
            aria-hidden="true"
            [disabled]="disabled()"
            (click)="toggleListbox()"
            (mousedown)="$event.preventDefault()"
          >
            <svg
              class="ct-combobox__trigger-icon"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 6l4 4 4-4"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>

        <ul
          #listboxEl
          [id]="listboxId"
          class="ct-combobox__listbox"
          role="listbox"
          [attr.aria-label]="label() || 'Options'"
        >
          @for (option of filteredOptions(); track option.value; let i = $index) {
            <li
              class="ct-combobox__option"
              role="option"
              [id]="getOptionId(i)"
              [attr.aria-selected]="isSelected(option)"
              [attr.aria-disabled]="option.disabled || null"
              [attr.data-highlighted]="highlightedIndex() === i ? '' : null"
              (click)="selectOption(option)"
              (mouseenter)="highlightedIndex.set(i)"
              (mousedown)="$event.preventDefault()"
            >
              <span class="ct-combobox__option-check" aria-hidden="true">
                @if (isSelected(option)) {
                  <svg viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8.5l3.5 3.5 6.5-8"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                }
              </span>
              <span class="ct-combobox__option-label">{{ option.label }}</span>
              @if (option.description) {
                <span class="ct-combobox__option-description">{{ option.description }}</span>
              }
            </li>
          }
          @if (filteredOptions().length === 0) {
            <li class="ct-combobox__empty" aria-disabled="true">
              {{ emptyText() }}
            </li>
          }
        </ul>

        <div
          class="ct-combobox__status"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {{ statusMessage() }}
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
export class AfComboboxComponent implements ControlValueAccessor {
  private static nextId = 0;

  /** Label for the combobox field */
  label = input('');

  /** Placeholder text for the input */
  placeholder = input('');

  /** Available options */
  options = input<AfComboboxOption[]>([]);

  /** Hint text shown below the combobox */
  hint = input('');

  /** Error message — shows error state and message */
  error = input('');

  /** Whether the combobox is required */
  required = input(false);

  /** Whether the combobox is disabled */
  disabled = model(false);

  /** Size variant */
  size = input<'sm' | 'md' | 'lg'>('md');

  /** Text shown when no options match the filter */
  emptyText = input('No results found');

  /** Value comparison function for object values */
  compareWith = input<(a: unknown, b: unknown) => boolean>((a, b) => a === b);

  /** Unique combobox ID */
  comboboxId = input(`af-combobox-${AfComboboxComponent.nextId++}`);

  inputRef = viewChild<ElementRef<HTMLInputElement>>('inputEl');
  listboxRef = viewChild<ElementRef<HTMLUListElement>>('listboxEl');

  isOpen = signal(false);
  query = signal('');
  highlightedIndex = signal(-1);

  private value = signal<unknown>(null);
  private onChange: (value: unknown) => void = () => {};
  private onTouchedCallback: () => void = () => {};

  get inputId(): string {
    return `${this.comboboxId()}-input`;
  }

  get listboxId(): string {
    return `${this.comboboxId()}-listbox`;
  }

  get hintId(): string {
    return `${this.comboboxId()}-hint`;
  }

  get errorId(): string {
    return `${this.comboboxId()}-error`;
  }

  comboboxClasses = computed(() => {
    const classes = ['ct-combobox'];
    const s = this.size();
    if (s === 'sm') classes.push('ct-combobox--sm');
    if (s === 'lg') classes.push('ct-combobox--lg');
    return classes.join(' ');
  });

  selectedOption = computed(() => {
    const v = this.value();
    if (v === null || v === undefined) return null;
    return this.options().find((o) => this.compareWith()(o.value, v)) ?? null;
  });

  filteredOptions = computed(() => {
    const q = this.query().toLowerCase().trim();
    const opts = this.options();
    if (!q) return opts;
    const selected = this.selectedOption();
    if (selected && selected.label.toLowerCase() === q) return opts;
    return opts.filter((o) => o.label.toLowerCase().includes(q));
  });

  activeDescendantId = computed(() => {
    const idx = this.highlightedIndex();
    if (idx < 0 || idx >= this.filteredOptions().length) return null;
    return this.getOptionId(idx);
  });

  statusMessage = computed(() => {
    if (!this.isOpen()) return '';
    const count = this.filteredOptions().length;
    if (count === 0) return this.emptyText();
    return `${count} result${count === 1 ? '' : 's'} available`;
  });

  getAriaDescribedBy(): string | null {
    if (this.error()) return this.errorId;
    if (this.hint()) return this.hintId;
    return null;
  }

  getOptionId(index: number): string {
    return `${this.comboboxId()}-option-${index}`;
  }

  isSelected(option: AfComboboxOption): boolean {
    const v = this.value();
    if (v === null || v === undefined) return false;
    return this.compareWith()(option.value, v);
  }

  /** Opens the listbox and highlights the selected option or first enabled option */
  openListbox(): void {
    if (this.disabled() || this.isOpen()) return;
    this.isOpen.set(true);
    this.highlightedIndex.set(this.findSelectedIndex());
  }

  /** Closes the listbox and restores the display value */
  closeListbox(restoreDisplay = true): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.highlightedIndex.set(-1);
    if (restoreDisplay) {
      const selected = this.selectedOption();
      this.query.set(selected ? selected.label : '');
    }
  }

  /** Toggles the listbox open/closed */
  toggleListbox(): void {
    if (this.isOpen()) {
      this.closeListbox();
    } else {
      this.openListbox();
      this.inputRef()?.nativeElement.focus();
    }
  }

  /** Selects an option and closes the listbox */
  selectOption(option: AfComboboxOption): void {
    if (option.disabled) return;
    this.value.set(option.value);
    this.query.set(option.label);
    this.onChange(option.value);
    this.closeListbox(false);
    this.inputRef()?.nativeElement.focus();
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.query.set(target.value);
    if (!this.isOpen()) {
      this.openListbox();
    }
    this.highlightedIndex.set(this.findFirstEnabledIndex());
    if (!target.value.trim()) {
      this.value.set(null);
      this.onChange(null);
    }
  }

  onFocus(): void {
    this.openListbox();
  }

  onBlur(): void {
    this.closeListbox();
    this.onTouchedCallback();
  }

  onKeydown(event: KeyboardEvent): void {
    const filtered = this.filteredOptions();

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
        event.preventDefault();
        if (this.isOpen()) {
          const idx = this.highlightedIndex();
          if (idx >= 0 && idx < filtered.length && !filtered[idx].disabled) {
            this.selectOption(filtered[idx]);
          }
        } else {
          this.openListbox();
        }
        break;

      case 'Escape':
        if (this.isOpen()) {
          event.preventDefault();
          this.closeListbox();
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
          const idx = this.highlightedIndex();
          if (idx >= 0 && idx < filtered.length && !filtered[idx].disabled) {
            this.selectOption(filtered[idx]);
          }
          this.closeListbox();
        }
        break;
    }
  }

  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const host = this.inputRef()?.nativeElement.closest('.ct-combobox');
    if (host && !host.contains(target)) {
      this.closeListbox();
      this.onTouchedCallback();
    }
  }

  /** Writes a value from the form model */
  writeValue(value: unknown): void {
    this.value.set(value ?? null);
    const option = this.options().find((o) => this.compareWith()(o.value, this.value()));
    this.query.set(option ? option.label : '');
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
    const filtered = this.filteredOptions();
    if (filtered.length === 0) return;

    let idx = this.highlightedIndex();
    let attempts = 0;

    do {
      idx += direction;
      if (idx < 0) idx = filtered.length - 1;
      if (idx >= filtered.length) idx = 0;
      attempts++;
    } while (filtered[idx]?.disabled && attempts < filtered.length);

    if (!filtered[idx]?.disabled) {
      this.highlightedIndex.set(idx);
      this.scrollHighlightedIntoView();
    }
  }

  private scrollHighlightedIntoView(): void {
    queueMicrotask(() => {
      const listbox = this.listboxRef()?.nativeElement;
      if (!listbox) return;
      const optionEl = listbox.querySelector('[data-highlighted]') as HTMLElement;
      optionEl?.scrollIntoView?.({ block: 'nearest' });
    });
  }

  private findSelectedIndex(): number {
    const v = this.value();
    if (v === null || v === undefined) return this.findFirstEnabledIndex();
    const filtered = this.filteredOptions();
    const idx = filtered.findIndex((o) => this.compareWith()(o.value, v));
    return idx >= 0 ? idx : this.findFirstEnabledIndex();
  }

  private findFirstEnabledIndex(): number {
    return this.filteredOptions().findIndex((o) => !o.disabled);
  }

  private findLastEnabledIndex(): number {
    const filtered = this.filteredOptions();
    for (let i = filtered.length - 1; i >= 0; i--) {
      if (!filtered[i].disabled) return i;
    }
    return -1;
  }
}

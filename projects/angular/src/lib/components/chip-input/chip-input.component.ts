import {
  Component,
  ElementRef,
  viewChild,
  forwardRef,
  input,
  output,
  model,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Chip input component for managing a list of string values.
 *
 * Renders existing values as removable chips and provides a text input
 * that creates new chips on configurable separator keys (Enter, Comma, Semicolon).
 * Implements ControlValueAccessor for seamless integration with Angular Reactive Forms
 * and template-driven forms, binding to a `string[]` value.
 *
 * @example
 * <af-chip-input
 *   label="Roles"
 *   placeholder="Add role..."
 *   [(ngModel)]="roles">
 * </af-chip-input>
 *
 * @example
 * <af-chip-input
 *   label="Tags"
 *   [separators]="[',', ';']"
 *   [formControl]="tagsControl">
 * </af-chip-input>
 */
@Component({
  selector: 'af-chip-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AfChipInputComponent),
      multi: true,
    },
  ],
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
        class="ct-chip-input"
        [class.ct-chip-input--disabled]="disabled()"
        [class.ct-chip-input--focused]="focused()"
        (click)="focusInput()">
        @for (chip of chips(); track chip) {
          <span
            class="ct-chip"
            [attr.aria-disabled]="disabled() || null">
            <span class="ct-chip__label">{{ chip }}</span>
            @if (!disabled()) {
              <button
                type="button"
                class="ct-chip__remove"
                [attr.aria-label]="'Remove ' + chip"
                (click)="remove(chip, $event)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            }
          </span>
        }

        <input
          #chipInput
          [id]="inputId"
          type="text"
          class="ct-chip-input__input"
          [placeholder]="chips().length === 0 ? placeholder() : ''"
          [disabled]="disabled()"
          [attr.aria-invalid]="error() ? true : null"
          [attr.aria-describedby]="getAriaDescribedBy()"
          (keydown)="onKeydown($event)"
          (input)="onInputChange($event)"
          (focus)="focused.set(true)"
          (blur)="onBlur()"
        />
      </div>

      @if (hint() && !error()) {
        <div class="ct-field__hint" [id]="hintId()">
          {{ hint() }}
        </div>
      }

      @if (error()) {
        <div class="ct-field__error" [id]="errorId()">
          {{ error() }}
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .ct-chip-input {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--space-2, 0.5rem);
        padding: var(--space-2, 0.5rem);
        border: var(--border-thin, 1px solid) var(--color-border-default, #d1d5db);
        border-radius: var(--radius-md, 0.375rem);
        background: var(--color-bg-default, #fff);
        cursor: text;
        transition: border-color var(--duration-fast, 150ms) var(--easing-standard, ease);
      }

      .ct-chip-input--focused {
        border-color: var(--color-focus-ring, #2563eb);
        outline: 2px solid var(--color-focus-ring, #2563eb);
        outline-offset: 2px;
      }

      .ct-chip-input--disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .ct-chip-input__input {
        flex: 1 1 auto;
        min-width: 80px;
        border: none;
        outline: none;
        background: transparent;
        font: inherit;
        color: inherit;
        padding: var(--space-1, 0.25rem) 0;
      }

      .ct-chip-input__input:disabled {
        cursor: not-allowed;
      }
    `,
  ],
})
export class AfChipInputComponent implements ControlValueAccessor {
  private static nextId = 0;

  /** Label shown above the input */
  label = input('');

  /** Placeholder text for the text input */
  placeholder = input('');

  /** Hint text shown below the input */
  hint = input('');

  /** Error message -- shows error state */
  error = input('');

  /** Whether the field is required */
  required = input(false);

  /** Whether the component is disabled */
  disabled = model(false);

  /** Whether to allow duplicate chip values */
  allowDuplicates = input(false);

  /** Separator characters that trigger chip creation (in addition to Enter) */
  separators = input<string[]>([',', ';']);

  /** Emitted when a chip is added */
  added = output<string>();

  /** Emitted when a chip is removed */
  removed = output<string>();

  inputRef = viewChild.required<ElementRef<HTMLInputElement>>('chipInput');

  inputId = `af-chip-input-${AfChipInputComponent.nextId++}`;
  chips = signal<string[]>([]);
  focused = signal(false);

  private onChange: (value: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  hintId = computed(() => `${this.inputId}-hint`);

  errorId = computed(() => `${this.inputId}-error`);

  getAriaDescribedBy(): string | null {
    if (this.error()) return this.errorId();
    if (this.hint()) return this.hintId();
    return null;
  }

  focusInput(): void {
    this.inputRef().nativeElement.focus();
  }

  onKeydown(event: KeyboardEvent): void {
    const inputEl = event.target as HTMLInputElement;
    const value = inputEl.value.trim();

    if (event.key === 'Enter') {
      event.preventDefault();
      this.addChip(value, inputEl);
      return;
    }

    if (this.separators().includes(event.key)) {
      event.preventDefault();
      this.addChip(value, inputEl);
      return;
    }

    const currentChips = this.chips();
    if (event.key === 'Backspace' && value === '' && currentChips.length > 0) {
      this.remove(currentChips[currentChips.length - 1]);
    }
  }

  onInputChange(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const value = inputEl.value;

    // Handle paste with separators
    for (const sep of this.separators()) {
      if (value.includes(sep)) {
        const parts = value.split(new RegExp(`[${this.escapeSeparators()}]`));
        inputEl.value = '';
        for (const part of parts) {
          const trimmed = part.trim();
          if (trimmed) {
            this.addChipValue(trimmed);
          }
        }
        return;
      }
    }
  }

  onBlur(): void {
    this.focused.set(false);
    this.onTouched();
  }

  /** Removes a chip by value */
  remove(chip: string, event?: Event): void {
    event?.stopPropagation();
    const current = this.chips();
    const index = current.indexOf(chip);
    if (index >= 0) {
      this.chips.set([...current.slice(0, index), ...current.slice(index + 1)]);
      this.emitChange();
      this.removed.emit(chip);
    }
  }

  // ControlValueAccessor
  writeValue(value: string[]): void {
    this.chips.set(Array.isArray(value) ? [...value] : []);
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  private addChip(value: string, inputEl: HTMLInputElement): void {
    if (value) {
      this.addChipValue(value);
      inputEl.value = '';
    }
  }

  private addChipValue(value: string): void {
    if (!this.allowDuplicates() && this.chips().includes(value)) {
      return;
    }
    this.chips.update(c => [...c, value]);
    this.emitChange();
    this.added.emit(value);
  }

  private emitChange(): void {
    this.onChange([...this.chips()]);
  }

  private escapeSeparators(): string {
    return this.separators().map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('');
  }
}

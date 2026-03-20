import { Component, ChangeDetectionStrategy, computed, input, model, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface AfSelectOption {
  value: unknown;
  label: string;
  disabled?: boolean;
}

/**
 * Select dropdown component with form control support
 *
 * @example
 * <af-select
 *   label="Role"
 *   [options]="roleOptions"
 *   [(ngModel)]="selectedRole"
 *   hint="Choose your primary role"
 * ></af-select>
 */
@Component({
  selector: 'af-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AfSelectComponent),
      multi: true
    }
  ],
  template: `
    <div class="ct-field" [class.ct-field--error]="error()">
      @if (label()) {
        <label class="ct-field__label" [attr.for]="selectId()">
          {{ label() }}
          @if (required()) {
            <span aria-label="required"> *</span>
          }
        </label>
      }

      <select
        [id]="selectId()"
        class="ct-select"
        [disabled]="disabled()"
        [required]="required()"
        [attr.aria-invalid]="error() ? true : null"
        [attr.aria-describedby]="getAriaDescribedBy()"
        (change)="onChange($event)"
        (blur)="onTouched()"
      >
        @if (placeholder()) {
          <option value="" [disabled]="true" [selected]="isPlaceholderSelected">
            {{ placeholder() }}
          </option>
        }
        @for (option of options(); track option.value) {
          <option
            [selected]="isOptionSelected(option)"
            [disabled]="option.disabled || false"
          >
            {{ option.label }}
          </option>
        }
      </select>

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
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AfSelectComponent implements ControlValueAccessor {
  private static nextId = 0;

  /** Select label */
  label = input('');

  /** Placeholder option */
  placeholder = input('');

  /** Options array */
  options = input<AfSelectOption[]>([]);

  /** Hint text shown below select */
  hint = input('');

  /** Error message */
  error = input('');

  /** Whether select is required */
  required = input(false);

  /** Whether select is disabled */
  disabled = model(false);

  /** Value comparison function (for object values) */
  compareWith = input<(a: unknown, b: unknown) => boolean>((a, b) => a === b);

  /** Unique select ID */
  selectId = input(`af-select-${AfSelectComponent.nextId++}`);

  value: unknown = null;
  onChangeCallback: (value: unknown) => void = () => {};
  onTouched: () => void = () => {};

  hintId = computed(() => `${this.selectId()}-hint`);

  errorId = computed(() => `${this.selectId()}-error`);

  getAriaDescribedBy(): string | null {
    if (this.error()) return this.errorId();
    if (this.hint()) return this.hintId();
    return null;
  }

  get isPlaceholderSelected(): boolean {
    if (!this.placeholder()) return false;
    if (this.value === null || this.value === undefined || this.value === '') return true;
    return !this.hasMatchingOption();
  }

  private hasMatchingOption(): boolean {
    return this.options().some(option => this.compareWith()(option.value, this.value));
  }

  isOptionSelected(option: AfSelectOption): boolean {
    if (this.isPlaceholderSelected) return false;
    return this.compareWith()(option.value, this.value);
  }

  onChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const index = target.selectedIndex;
    const offset = this.placeholder() ? 1 : 0;

    if (this.placeholder() && index === 0) {
      this.value = null;
      this.onChangeCallback(null);
      return;
    }

    const option = this.options()[index - offset];
    const nextValue = option ? option.value : null;
    this.value = nextValue;
    this.onChangeCallback(nextValue);
  }

  /** ControlValueAccessor implementation */
  writeValue(value: unknown): void {
    this.value = value ?? null;
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}

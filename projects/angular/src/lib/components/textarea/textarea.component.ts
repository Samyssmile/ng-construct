import { Component, ChangeDetectionStrategy, computed, input, model, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Textarea component with form control support
 *
 * @example
 * <af-textarea
 *   label="Notes"
 *   placeholder="Enter your notes..."
 *   [(ngModel)]="notes"
 *   [rows]="5"
 * ></af-textarea>
 */
@Component({
  selector: 'af-textarea',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AfTextareaComponent),
      multi: true
    }
  ],
  template: `
    <div class="ct-field" [class.ct-field--error]="error()">
      @if (label()) {
        <label class="ct-field__label" [attr.for]="textareaId()">
          {{ label() }}
          @if (required()) {
            <span aria-label="required"> *</span>
          }
        </label>
      }

      <textarea
        [id]="textareaId()"
        class="ct-textarea"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [required]="required()"
        [rows]="rows()"
        [attr.aria-invalid]="error() ? true : null"
        [attr.aria-describedby]="getAriaDescribedBy()"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onTouched()"
      ></textarea>

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
export class AfTextareaComponent implements ControlValueAccessor {
  private static nextId = 0;

  /** Textarea label */
  label = input('');

  /** Placeholder text */
  placeholder = input('');

  /** Hint text shown below textarea */
  hint = input('');

  /** Error message */
  error = input('');

  /** Whether textarea is required */
  required = input(false);

  /** Whether textarea is disabled */
  disabled = model(false);

  /** Number of visible rows */
  rows = input(3);

  /** Unique textarea ID */
  textareaId = input(`af-textarea-${AfTextareaComponent.nextId++}`);

  value = '';
  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  hintId = computed(() => `${this.textareaId()}-hint`);

  errorId = computed(() => `${this.textareaId()}-error`);

  getAriaDescribedBy(): string | null {
    if (this.error()) return this.errorId();
    if (this.hint()) return this.hintId();
    return null;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  /** ControlValueAccessor implementation */
  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}

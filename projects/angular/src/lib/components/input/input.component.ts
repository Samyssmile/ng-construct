import { Component, ChangeDetectionStrategy, computed, input, model, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type AfInputType = 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';

/**
 * Input field component with form control support
 *
 * @example
 * <af-input
 *   label="Email"
 *   type="email"
 *   placeholder="name@company.com"
 *   [(ngModel)]="email"
 *   hint="We will not share this."
 * ></af-input>
 *
 * @example
 * <af-input
 *   label="Name"
 *   [error]="nameError"
 *   required
 * ></af-input>
 */
@Component({
  selector: 'af-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AfInputComponent),
      multi: true
    }
  ],
  template: `
    <div class="ct-field" [class.ct-field--error]="error()">
      @if (label()) {
        <label class="ct-field__label" [attr.for]="inputId()">
          {{ label() }}
          @if (required()) {
            <span aria-label="required"> *</span>
          }
        </label>
      }

      @if (iconPosition()) {
        <div class="ct-input-wrap">
          @if (iconPosition() === 'left') {
            <span class="ct-input__icon" aria-hidden="true">
              <ng-content select="[icon]"></ng-content>
            </span>
          }
          <input
            [id]="inputId()"
            [type]="type()"
            [placeholder]="placeholder()"
            [disabled]="disabled()"
            [required]="required()"
            [attr.aria-invalid]="error() ? true : null"
            [attr.aria-describedby]="getAriaDescribedBy()"
            [class]="inputClasses()"
            [value]="value"
            (input)="onInput($event)"
            (blur)="onTouched()"
          />
          @if (iconPosition() === 'right') {
            <span class="ct-input__icon" aria-hidden="true">
              <ng-content select="[icon]"></ng-content>
            </span>
          }
        </div>
      }

      @if (!iconPosition()) {
        <input
          [id]="inputId()"
          [type]="type()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [required]="required()"
          [attr.aria-invalid]="error() ? true : null"
          [attr.aria-describedby]="getAriaDescribedBy()"
          class="ct-input"
          [value]="value"
          (input)="onInput($event)"
          (blur)="onTouched()"
        />
      }

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
export class AfInputComponent implements ControlValueAccessor {
  private static nextId = 0;

  /** Input label */
  label = input('');

  /** Input type */
  type = input<AfInputType>('text');

  /** Placeholder text */
  placeholder = input('');

  /** Hint text shown below input */
  hint = input('');

  /** Error message - shows error state and message */
  error = input('');

  /** Whether input is required */
  required = input(false);

  /** Whether input is disabled */
  disabled = model(false);

  /** Icon position (if icon content is projected) */
  iconPosition = input<'left' | 'right' | null>(null);

  /** Unique input ID */
  inputId = input(`af-input-${AfInputComponent.nextId++}`);

  value = '';
  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  hintId = computed(() => `${this.inputId()}-hint`);

  errorId = computed(() => `${this.inputId()}-error`);

  inputClasses = computed(() => {
    const classes = ['ct-input'];
    if (this.iconPosition()) {
      classes.push('ct-input--with-icon');
    }
    return classes.join(' ');
  });

  getAriaDescribedBy(): string | null {
    if (this.error()) return this.errorId();
    if (this.hint()) return this.hintId();
    return null;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
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

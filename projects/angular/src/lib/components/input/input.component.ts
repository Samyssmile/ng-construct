import {
  Component,
  ChangeDetectionStrategy,
  computed,
  input,
  model,
  forwardRef,
  inject,
  booleanAttribute,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AF_INPUT_I18N } from './input.i18n';

export type AfInputType = 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';

/**
 * Input field component with form control support.
 *
 * Wraps a native `<input>` element with label, hint, error, and icon slots.
 * Implements `ControlValueAccessor` for seamless `ngModel` and `formControl` integration.
 *
 * @example
 * <af-input
 *   label="Email"
 *   type="email"
 *   placeholder="name@company.com"
 *   [(ngModel)]="email"
 *   hint="We will not share this."
 * />
 *
 * @example
 * <af-input
 *   label="Name"
 *   [error]="nameError"
 *   required
 * />
 */
@Component({
  selector: 'af-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AfInputComponent),
      multi: true,
    },
  ],
  host: {
    style: 'display: block',
  },
  template: `
    <div class="ct-field" [class.ct-field--error]="error()">
      @if (label()) {
        <label class="ct-field__label" [attr.for]="inputId()">
          {{ label() }}
          @if (required()) {
            <span [attr.aria-label]="i18n.required"> *</span>
          }
        </label>
      }

      @if (iconPosition()) {
        <div class="ct-input-wrap">
          @if (iconPosition() === 'left') {
            <span class="ct-input__icon" aria-hidden="true">
              <ng-content select="[icon]" />
            </span>
          }
          <input
            [id]="inputId()"
            [type]="type()"
            [placeholder]="placeholder()"
            [disabled]="disabled()"
            [required]="required()"
            [attr.aria-invalid]="error() ? true : null"
            [attr.aria-describedby]="ariaDescribedBy()"
            [class]="inputClasses()"
            [value]="value()"
            (input)="onInput($event)"
            (blur)="onTouched()"
          />
          @if (iconPosition() === 'right') {
            <span class="ct-input__icon" aria-hidden="true">
              <ng-content select="[icon]" />
            </span>
          }
        </div>
      } @else {
        <input
          [id]="inputId()"
          [type]="type()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [required]="required()"
          [attr.aria-invalid]="error() ? true : null"
          [attr.aria-describedby]="ariaDescribedBy()"
          [class]="inputClasses()"
          [value]="value()"
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
        <div class="ct-field__error" role="alert" [id]="errorId()">
          {{ error() }}
        </div>
      }
    </div>
  `,
})
export class AfInputComponent implements ControlValueAccessor {
  private static nextId = 0;

  readonly i18n = inject(AF_INPUT_I18N);

  /** Input label. */
  label = input('');

  /** Input type. */
  type = input<AfInputType>('text');

  /** Placeholder text. */
  placeholder = input('');

  /** Hint text shown below input. */
  hint = input('');

  /** Error message — shows error state and message. */
  error = input('');

  /** Whether input is required. */
  required = input(false, { transform: booleanAttribute });

  /** Whether input is disabled. */
  disabled = model(false);

  /** Icon position (if icon content is projected). */
  iconPosition = input<'left' | 'right' | null>(null);

  /** Unique input ID. */
  inputId = input(`af-input-${AfInputComponent.nextId++}`);

  /** @docs-private — internal form value managed by CVA. */
  readonly value = signal('');
  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  /** Computed hint element ID. */
  hintId = computed(() => `${this.inputId()}-hint`);

  /** Computed error element ID. */
  errorId = computed(() => `${this.inputId()}-error`);

  /** Computed CSS classes for the inner input. */
  inputClasses = computed(() => {
    const classes = ['ct-input'];
    if (this.iconPosition()) {
      classes.push('ct-input--with-icon');
    }
    return classes.join(' ');
  });

  /** Computed `aria-describedby` value linking to hint or error. */
  ariaDescribedBy = computed(() => {
    if (this.error()) return this.errorId();
    if (this.hint()) return this.hintId();
    return null;
  });

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value.set(target.value);
    this.onChange(this.value());
  }

  /** @docs-private */
  writeValue(value: string): void {
    this.value.set(value || '');
  }

  /** @docs-private */
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  /** @docs-private */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /** @docs-private */
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}

import { Component, ChangeDetectionStrategy, computed, input, model, signal, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Radio button component with form control support
 *
 * @example
 * <af-radio name="plan" value="standard" [(ngModel)]="selectedPlan">
 *   Standard
 * </af-radio>
 * <af-radio name="plan" value="premium" [(ngModel)]="selectedPlan">
 *   Premium
 * </af-radio>
 */
@Component({
  selector: 'af-radio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AfRadioComponent),
      multi: true
    }
  ],
  template: `
    <label class="ct-radio">
      <input
        class="ct-radio__input"
        type="radio"
        [name]="name()"
        [value]="value()"
        [checked]="isChecked()"
        [disabled]="disabled()"
        (change)="onChangeEvent($event)"
        (blur)="onTouched()"
      />
      <span class="ct-radio__label">
        <ng-content></ng-content>
      </span>
    </label>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AfRadioComponent implements ControlValueAccessor {
  /** Radio group name */
  name = input('');

  /** Radio value */
  value = input<unknown>(undefined);

  /** Whether radio is disabled */
  disabled = model(false);

  modelValue = signal<unknown>(undefined);
  onChangeCallback: (value: unknown) => void = () => {};
  onTouched: () => void = () => {};

  isChecked = computed(() => this.modelValue() === this.value());

  onChangeEvent(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.modelValue.set(this.value());
      this.onChangeCallback(this.value());
    }
  }

  /** ControlValueAccessor implementation */
  writeValue(value: unknown): void {
    this.modelValue.set(value);
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

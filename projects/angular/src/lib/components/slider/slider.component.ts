import {
  Component,
  ChangeDetectionStrategy,
  computed,
  input,
  model,
  forwardRef,
  ElementRef,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type AfSliderSize = 'sm' | 'md' | 'lg';

/**
 * Slider component with full form control and accessibility support.
 *
 * Wraps the `ct-slider` design system CSS. Supports min/max/step,
 * keyboard navigation, ARIA attributes, and reactive forms.
 *
 * @example Reactive Forms
 * <af-slider formControlName="volume" [min]="0" [max]="100" label="Volume" />
 *
 * @example Standalone two-way binding
 * <af-slider [(value)]="brightness" [min]="0" [max]="100" [step]="5" [showValue]="true" />
 *
 * @example With min/max labels
 * <af-slider [(value)]="temperature" [min]="16" [max]="30" [showMinMax]="true" label="Temperature" />
 */
@Component({
  selector: 'af-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AfSliderComponent),
      multi: true,
    },
  ],
  template: `
    <div [class]="hostClasses()" [style.--_value]="valuePercent()">
      @if (showMinMax()) {
        <span class="ct-slider__min" aria-hidden="true">{{ min() }}</span>
      }

      <input
        #sliderInput
        class="ct-slider__input"
        type="range"
        [id]="sliderId()"
        [attr.min]="min()"
        [attr.max]="max()"
        [attr.step]="step()"
        [disabled]="disabled()"
        [value]="value()"
        [attr.aria-label]="label()"
        [attr.aria-valuenow]="value()"
        [attr.aria-valuemin]="min()"
        [attr.aria-valuemax]="max()"
        [attr.aria-valuetext]="ariaValueText()"
        [attr.aria-invalid]="invalid() ? true : null"
        (input)="onInput($event)"
        (blur)="onTouched()"
      />

      @if (showMinMax()) {
        <span class="ct-slider__max" aria-hidden="true">{{ max() }}</span>
      }

      @if (showValue()) {
        <output class="ct-slider__value" [attr.for]="sliderId()">
          {{ value() }}
        </output>
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
export class AfSliderComponent implements ControlValueAccessor {
  private static nextId = 0;

  /** Accessible label for the slider */
  label = input('');

  /** Minimum value */
  min = input(0);

  /** Maximum value */
  max = input(100);

  /** Step increment */
  step = input(1);

  /** Component size variant */
  size = input<AfSliderSize>('md');

  /** Whether the slider is disabled */
  disabled = model(false);

  /** Whether the slider is in an invalid state */
  invalid = input(false);

  /** Show the current value next to the slider */
  showValue = input(false);

  /** Show min/max labels */
  showMinMax = input(false);

  /** Custom aria-valuetext for screen readers */
  valueTextFn = input<((value: number) => string) | null>(null);

  /** Unique slider ID */
  sliderId = input(`af-slider-${AfSliderComponent.nextId++}`);

  /** Current value — supports two-way binding via [(value)] */
  value = model(0);

  sliderInput = viewChild.required<ElementRef<HTMLInputElement>>('sliderInput');

  private onChangeCallback: (value: number) => void = () => {};
  onTouched: () => void = () => {};

  hostClasses = computed(() => {
    const classes = ['ct-slider'];
    const s = this.size();
    if (s !== 'md') {
      classes.push(`ct-slider--${s}`);
    }
    return classes.join(' ');
  });

  valuePercent = computed(() => {
    const minVal = this.min();
    const maxVal = this.max();
    const range = maxVal - minVal;
    if (range === 0) return 0;
    return ((this.value() - minVal) / range) * 100;
  });

  ariaValueText = computed(() => {
    const fn = this.valueTextFn();
    return fn ? fn(this.value()) : null;
  });

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const numValue = Number(target.value);
    this.value.set(numValue);
    this.onChangeCallback(numValue);
  }

  /** Writes a new value from the form model. */
  writeValue(value: number): void {
    this.value.set(value ?? 0);
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}

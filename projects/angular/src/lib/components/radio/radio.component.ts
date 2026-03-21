import {
  Component,
  ChangeDetectionStrategy,
  computed,
  contentChildren,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

// ── Radio Button ─────────────────────────────────────────────────────────────

/**
 * Individual radio button. Use inside `af-radio-group` for full
 * accessibility, or standalone with its own `ControlValueAccessor`.
 *
 * @example
 * <af-radio-group ariaLabel="Plan" name="plan" [(ngModel)]="plan">
 *   <af-radio value="standard">Standard</af-radio>
 *   <af-radio value="premium">Premium</af-radio>
 * </af-radio-group>
 */
@Component({
  selector: 'af-radio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AfRadioComponent),
      multi: true,
    },
  ],
  template: `
    <label class="ct-radio">
      <input
        #inputEl
        class="ct-radio__input"
        type="radio"
        [name]="resolvedName()"
        [value]="value()"
        [checked]="isChecked()"
        [disabled]="isDisabled()"
        [attr.tabindex]="resolvedTabindex()"
        (change)="onChangeEvent()"
        (blur)="onTouched()"
        (focus)="onFocus()"
        (keydown)="onKeydown($event)" />
      <span class="ct-radio__label">
        <ng-content />
      </span>
    </label>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class AfRadioComponent implements ControlValueAccessor {
  private group = inject(forwardRef(() => AfRadioGroupComponent), { optional: true });

  /** Radio group name (only used without `af-radio-group`). */
  name = input('');

  /** Radio value. */
  value = input<unknown>(undefined);

  /** Whether this radio is disabled. */
  disabled = model(false);

  inputRef = viewChild.required<ElementRef<HTMLInputElement>>('inputEl');

  modelValue = signal<unknown>(undefined);
  onChangeCallback: (value: unknown) => void = () => {};
  onTouched: () => void = () => {};

  resolvedName = computed(() => this.group?.name() || this.name());

  isChecked = computed(() => {
    const selected = this.group ? this.group.selectedValue() : this.modelValue();
    return selected === this.value();
  });

  isDisabled = computed(() => {
    if (this.group?.disabled()) return true;
    return this.disabled();
  });

  resolvedTabindex = computed(() => {
    if (!this.group) return null;
    return this.group.tabindexFor(this);
  });

  /** Focuses the native input element. */
  focus(): void {
    this.inputRef().nativeElement.focus();
  }

  onChangeEvent(): void {
    if (this.group) {
      this.group.selectRadio(this);
    } else {
      this.modelValue.set(this.value());
      this.onChangeCallback(this.value());
    }
  }

  onFocus(): void {
    this.group?.onRadioFocus(this);
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.group) {
      this.group.onRadioKeydown(event, this);
    }
  }

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

// ── Radio Group ──────────────────────────────────────────────────────────────

/**
 * Groups `af-radio` components with `role="radiogroup"`, ARIA labeling,
 * roving tabindex, and arrow-key navigation per WAI-ARIA Radio Group Pattern.
 *
 * Implements `ControlValueAccessor` so the group value can be bound via
 * `[(ngModel)]` or reactive forms.
 *
 * @example
 * <af-radio-group ariaLabel="Select plan" name="plan" [(ngModel)]="plan">
 *   <af-radio value="standard">Standard</af-radio>
 *   <af-radio value="premium">Premium</af-radio>
 * </af-radio-group>
 */
@Component({
  selector: 'af-radio-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AfRadioGroupComponent),
      multi: true,
    },
  ],
  template: `
    <div
      role="radiogroup"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-labelledby]="ariaLabelledBy() || null"
      [attr.aria-disabled]="disabled() || null">
      <ng-content />
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
export class AfRadioGroupComponent implements ControlValueAccessor {
  /** Shared `name` attribute for all child radios. */
  name = input.required<string>();

  /** Accessible label for the radio group. */
  ariaLabel = input('');

  /** ID of an external element labeling this group. */
  ariaLabelledBy = input('');

  /** Disables all radios in the group. */
  disabled = model(false);

  radios = contentChildren(AfRadioComponent);

  selectedValue = signal<unknown>(undefined);
  private focusedIndex = signal(0);

  private onChangeCallback: (value: unknown) => void = () => {};
  private onTouchedCallback: () => void = () => {};

  private syncEffect = effect(() => {
    const radios = this.radios();
    const value = this.selectedValue();
    const checkedIdx = radios.findIndex((r) => r.value() === value);
    this.focusedIndex.set(checkedIdx >= 0 ? checkedIdx : 0);
  });

  /** Returns the tabindex a child radio should use for roving tabindex. */
  tabindexFor(radio: AfRadioComponent): number {
    const radios = this.enabledRadios();
    const idx = radios.indexOf(radio);
    if (idx === -1) return -1;
    return idx === this.focusedIndex() ? 0 : -1;
  }

  /** Selects a radio and propagates the value. */
  selectRadio(radio: AfRadioComponent): void {
    const value = radio.value();
    this.selectedValue.set(value);
    this.onChangeCallback(value);
    this.onTouchedCallback();
  }

  /** Called when a child radio receives focus. */
  onRadioFocus(radio: AfRadioComponent): void {
    const idx = this.enabledRadios().indexOf(radio);
    if (idx >= 0) {
      this.focusedIndex.set(idx);
    }
  }

  /** Handles keyboard navigation within the group. */
  onRadioKeydown(event: KeyboardEvent, _current: AfRadioComponent): void {
    const enabled = this.enabledRadios();
    if (enabled.length === 0) return;

    let nextIndex: number | null = null;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        nextIndex = (this.focusedIndex() + 1) % enabled.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        nextIndex = (this.focusedIndex() - 1 + enabled.length) % enabled.length;
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        nextIndex = enabled.length - 1;
        break;
      case ' ':
        event.preventDefault();
        this.selectRadio(enabled[this.focusedIndex()]);
        return;
    }

    if (nextIndex !== null) {
      this.focusedIndex.set(nextIndex);
      const target = enabled[nextIndex];
      target.focus();
      this.selectRadio(target);
    }
  }

  writeValue(value: unknown): void {
    this.selectedValue.set(value);
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedCallback = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  private enabledRadios(): AfRadioComponent[] {
    return this.radios().filter((r) => !r.isDisabled());
  }
}

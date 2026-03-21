import { Component, ChangeDetectionStrategy, input, model, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Switch/Toggle component with form control support
 *
 * @example
 * <af-switch [(ngModel)]="autoRenew">
 *   Auto renew
 * </af-switch>
 */
@Component({
  selector: 'af-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AfSwitchComponent),
      multi: true
    }
  ],
  template: `
    <label class="ct-switch">
      <input
        class="ct-switch__input"
        type="checkbox"
        role="switch"
        [checked]="checked()"
        [disabled]="disabled()"
        [attr.aria-label]="ariaLabel() || null"
        (change)="onChange($event)"
        (blur)="onTouched()" />
      <span class="ct-switch__label">
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
export class AfSwitchComponent implements ControlValueAccessor {
  /** Accessible label for icon-only or unlabeled switches. */
  ariaLabel = input('');

  /** Whether switch is disabled. */
  disabled = model(false);

  /** Checked state - supports two-way binding via [(checked)] */
  checked = model(false);

  private onChangeCallback: (value: boolean) => void = () => {};
  onTouched: () => void = () => {};

  onChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checked.set(target.checked);
    this.onChangeCallback(target.checked);
  }

  /** ControlValueAccessor implementation */
  writeValue(value: boolean): void {
    this.checked.set(!!value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}

import { Component, ChangeDetectionStrategy, model, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Checkbox component with form control support
 *
 * Supports both ControlValueAccessor (reactive forms / ngModel) and
 * standalone usage via [(checked)] bindings (two-way via model).
 *
 * @example Reactive Forms
 * <af-checkbox formControlName="rememberMe">Remember me</af-checkbox>
 *
 * @example Standalone with indeterminate (e.g. "select all" in tables)
 * <af-checkbox
 *   [(checked)]="allSelected"
 *   [indeterminate]="hasPartialSelection()"
 *   (checkedChange)="onToggleAll($event)">
 * </af-checkbox>
 */
@Component({
  selector: 'af-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AfCheckboxComponent),
      multi: true
    }
  ],
  template: `
    <label class="ct-check">
      <input
        class="ct-check__input"
        type="checkbox"
        [checked]="checked()"
        [disabled]="disabled()"
        [indeterminate]="indeterminate()"
        (change)="onChange($event)"
        (blur)="onTouched()"
      />
      <span class="ct-check__label">
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
export class AfCheckboxComponent implements ControlValueAccessor {
  /** Whether checkbox is disabled */
  disabled = model(false);

  /** Whether checkbox shows indeterminate state (partial selection) */
  indeterminate = model(false);

  /** Checked state - supports two-way binding via [(checked)] */
  checked = model(false);

  private onChangeCallback: (value: boolean) => void = () => {};
  onTouched: () => void = () => {};

  onChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checked.set(target.checked);
    this.indeterminate.set(false);
    this.onChangeCallback(target.checked);
  }

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

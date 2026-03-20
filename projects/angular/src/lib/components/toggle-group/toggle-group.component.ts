import { Component, forwardRef, input, output, model, computed, ChangeDetectionStrategy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface AfToggleItem {
  label: string;
  value: string;
  disabled?: boolean;
}

export type AfToggleGroupSize = 'sm' | 'md' | 'lg';

/**
 * Toggle group for single or multi-select button groups
 *
 * @example
 * <af-toggle-group
 *   [items]="viewModes"
 *   [(value)]="selectedMode"
 *   ariaLabel="View mode">
 * </af-toggle-group>
 *
 * <af-toggle-group
 *   [items]="filters"
 *   [multiple]="true"
 *   [(value)]="activeFilters"
 *   ariaLabel="Status filter">
 * </af-toggle-group>
 */
@Component({
  selector: 'af-toggle-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="groupClasses()" role="group" [attr.aria-label]="ariaLabel()">
      @for (item of items(); track item.value) {
        <button
          class="ct-toggle-group__item"
          type="button"
          [attr.aria-pressed]="isPressed(item.value)"
          [disabled]="item.disabled || disabled()"
          (click)="toggle(item.value)">
          {{ item.label }}
        </button>
      }
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AfToggleGroupComponent),
    multi: true
  }]
})
export class AfToggleGroupComponent implements ControlValueAccessor {
  /** Toggle items */
  items = input<AfToggleItem[]>([]);

  /** Group size */
  size = input<AfToggleGroupSize>('md');

  /** Allow multiple selections */
  multiple = input(false);

  /** Accessible group label */
  ariaLabel = input('');

  /** Disabled state */
  disabled = model(false);

  /** Current value (string for single, string[] for multiple) */
  value = model<string | string[]>('');

  private onChange: (value: string | string[]) => void = () => {};
  private onTouched: () => void = () => {};

  groupClasses = computed(() => {
    const classes = ['ct-toggle-group'];
    if (this.size() !== 'md') {
      classes.push(`ct-toggle-group--${this.size()}`);
    }
    return classes.join(' ');
  });

  isPressed(itemValue: string): boolean {
    if (this.multiple()) {
      return Array.isArray(this.value()) && (this.value() as string[]).includes(itemValue);
    }
    return this.value() === itemValue;
  }

  toggle(itemValue: string): void {
    this.onTouched();

    if (this.multiple()) {
      const current = Array.isArray(this.value()) ? [...this.value() as string[]] : [];
      const index = current.indexOf(itemValue);
      if (index >= 0) {
        current.splice(index, 1);
      } else {
        current.push(itemValue);
      }
      this.value.set(current);
    } else {
      this.value.set(itemValue);
    }

    this.onChange(this.value());
  }

  writeValue(value: string | string[]): void {
    this.value.set(value ?? (this.multiple() ? [] : ''));
  }

  registerOnChange(fn: (value: string | string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}

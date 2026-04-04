import {
  Component,
  ChangeDetectionStrategy,
  computed,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AriaLiveAnnouncer } from '../../utils/aria-live-announcer';
import { AF_SELECT_I18N } from './select.i18n';

export interface AfSelectOption {
  value: unknown;
  label: string;
  disabled?: boolean;
}

/**
 * Native select dropdown component with form control support.
 * Wraps a native `<select>` element with design system styling,
 * accessible labelling, and Angular forms integration.
 *
 * For a custom dropdown with keyboard-navigated listbox, see `af-select-menu`.
 *
 * @example Basic usage with ngModel
 * <af-select
 *   label="Role"
 *   [options]="roleOptions"
 *   [(ngModel)]="selectedRole"
 *   hint="Choose your primary role"
 * />
 *
 * @example Reactive forms with error state
 * <af-select
 *   label="Country"
 *   [options]="countries"
 *   [formControl]="countryControl"
 *   [error]="countryControl.hasError('required') ? 'Required field' : ''"
 * />
 *
 * @accessibility
 * - Uses a native `<select>` element for built-in browser accessibility.
 * - `aria-invalid` is set when an error message is provided.
 * - `aria-describedby` links to hint or error text.
 * - Falls back to `aria-label` via {@link AF_SELECT_I18N} when no `label` input is given.
 * - Screen-reader announcements via {@link AriaLiveAnnouncer} on selection change.
 * - All user-facing strings are configurable via {@link AF_SELECT_I18N} for i18n.
 */
@Component({
  selector: 'af-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AfSelectComponent),
      multi: true,
    },
  ],
  host: {
    style: 'display: block',
  },
  template: `
    <div class="ct-field" [class.ct-field--error]="error()">
      @if (label()) {
        <label class="ct-field__label" [id]="labelId()" [attr.for]="selectId()">
          {{ label() }}
          @if (required()) {
            <span [attr.aria-label]="i18n.required"> *</span>
          }
        </label>
      }

      <div class="ct-select-wrap">
        <select
          [id]="selectId()"
          [class]="selectClasses()"
          [disabled]="disabled()"
          [required]="required()"
          [attr.aria-invalid]="error() ? true : null"
          [attr.aria-describedby]="ariaDescribedBy()"
          [attr.aria-label]="label() ? null : i18n.selectOption"
          [attr.aria-labelledby]="label() ? labelId() : null"
          (change)="handleChange($event)"
          (blur)="onTouched()"
        >
          @if (placeholder()) {
            <option value="" [disabled]="true" [selected]="isPlaceholderSelected()">
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
      </div>

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
export class AfSelectComponent implements ControlValueAccessor {
  private static nextId = 0;
  protected readonly i18n = inject(AF_SELECT_I18N);
  private readonly announcer = inject(AriaLiveAnnouncer);

  /** Label shown above the select. */
  label = input('');

  /** Placeholder option shown when no value is selected. */
  placeholder = input('');

  /** Available options. */
  options = input<AfSelectOption[]>([]);

  /** Hint text shown below the select. */
  hint = input('');

  /** Error message — shows error state when non-empty. */
  error = input('');

  /** Whether the field is required. */
  required = input(false);

  /** Whether the select is disabled. */
  disabled = model(false);

  /** Size variant. */
  size = input<'sm' | 'md' | 'lg'>('md');

  /** Value comparison function for object values. */
  compareWith = input<(a: unknown, b: unknown) => boolean>((a, b) => a === b);

  /** Unique select ID. */
  selectId = input(`af-select-${AfSelectComponent.nextId++}`);

  /** Emits when the user changes the selected value. */
  valueChange = output<unknown>();

  private readonly value = signal<unknown>(null);
  private onChange: (value: unknown) => void = () => {};
  onTouched: () => void = () => {};

  labelId = computed(() => `${this.selectId()}-label`);
  hintId = computed(() => `${this.selectId()}-hint`);
  errorId = computed(() => `${this.selectId()}-error`);

  selectClasses = computed(() => {
    const classes = ['ct-select'];
    const s = this.size();
    if (s === 'sm') classes.push('ct-select--sm');
    if (s === 'lg') classes.push('ct-select--lg');
    return classes.join(' ');
  });

  ariaDescribedBy = computed(() => {
    if (this.error()) return this.errorId();
    if (this.hint()) return this.hintId();
    return null;
  });

  isPlaceholderSelected = computed(() => {
    if (!this.placeholder()) return false;
    const v = this.value();
    if (v === null || v === undefined || v === '') return true;
    return !this.hasMatchingOption();
  });

  isOptionSelected(option: AfSelectOption): boolean {
    if (this.isPlaceholderSelected()) return false;
    return this.compareWith()(option.value, this.value());
  }

  handleChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const index = target.selectedIndex;
    const offset = this.placeholder() ? 1 : 0;

    if (this.placeholder() && index === 0) {
      this.value.set(null);
      this.onChange(null);
      this.valueChange.emit(null);
      return;
    }

    const option = this.options()[index - offset];
    const nextValue = option ? option.value : null;
    this.value.set(nextValue);
    this.onChange(nextValue);
    this.valueChange.emit(nextValue);

    if (option) {
      this.announcer.announce(this.i18n.selected.replace('{label}', option.label));
    }
  }

  /** @docs-private */
  writeValue(value: unknown): void {
    this.value.set(value ?? null);
  }

  /** @docs-private */
  registerOnChange(fn: (value: unknown) => void): void {
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

  private hasMatchingOption(): boolean {
    return this.options().some((option) => this.compareWith()(option.value, this.value()));
  }
}

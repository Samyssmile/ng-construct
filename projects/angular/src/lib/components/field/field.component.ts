import {
  Component,
  ChangeDetectionStrategy,
  AfterContentInit,
  AfterContentChecked,
  ElementRef,
  computed,
  inject,
  input,
} from '@angular/core';

const CONTROL_SELECTORS = [
  'input',
  'select',
  'textarea',
  '[role="combobox"]',
  '[role="listbox"]',
  '[role="spinbutton"]',
  '[role="slider"]',
].join(',');

/**
 * Form field wrapper that binds label, hint, and error message to a projected form control.
 *
 * Automatically links the label via `for`/`id` and sets `aria-describedby`
 * and `aria-invalid` on the first interactive element found inside the projection.
 *
 * @example
 * <af-field label="Email" hint="We will not share this.">
 *   <input class="ct-input" type="email" />
 * </af-field>
 *
 * @example
 * <af-field label="Name" [error]="nameError" required>
 *   <input class="ct-input" />
 * </af-field>
 */
@Component({
  selector: 'af-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ct-field">
      @if (label()) {
        <label
          class="ct-field__label"
          [class.ct-field__label--required]="required()"
          [attr.for]="fieldId()"
        >
          {{ label() }}
        </label>
      }

      <ng-content></ng-content>

      @if (hint() && !error()) {
        <div class="ct-field__hint" [id]="hintId()">{{ hint() }}</div>
      }

      @if (error()) {
        <div class="ct-field__error" role="alert" [id]="errorId()">
          {{ error() }}
        </div>
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
export class AfFieldComponent implements AfterContentInit, AfterContentChecked {
  private static nextId = 0;

  /** Field label text */
  label = input('');

  /** Hint text shown below the control */
  hint = input('');

  /** Error message — replaces hint and marks the control as invalid */
  error = input('');

  /** Whether the field is required (appends visual indicator to label) */
  required = input(false);

  /** Unique ID applied to the projected control, auto-generated if omitted */
  fieldId = input(`af-field-${AfFieldComponent.nextId++}`);

  hintId = computed(() => `${this.fieldId()}-hint`);
  errorId = computed(() => `${this.fieldId()}-error`);

  private elementRef = inject(ElementRef);
  private controlEl: HTMLElement | null = null;

  ngAfterContentInit(): void {
    this.controlEl =
      this.elementRef.nativeElement.querySelector(CONTROL_SELECTORS);

    if (this.controlEl && !this.controlEl.id) {
      this.controlEl.id = this.fieldId();
    }
  }

  ngAfterContentChecked(): void {
    if (!this.controlEl) return;

    const error = this.error();
    const hint = this.hint();

    // aria-describedby
    if (error) {
      this.controlEl.setAttribute('aria-describedby', this.errorId());
    } else if (hint) {
      this.controlEl.setAttribute('aria-describedby', this.hintId());
    } else {
      this.controlEl.removeAttribute('aria-describedby');
    }

    // aria-invalid
    if (error) {
      this.controlEl.setAttribute('aria-invalid', 'true');
    } else {
      this.controlEl.removeAttribute('aria-invalid');
    }
  }
}

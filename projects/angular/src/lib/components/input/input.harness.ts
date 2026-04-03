/**
 * Test harness for AfInputComponent.
 *
 * Provides a semantic API for interacting with the input in tests,
 * abstracting DOM details behind readable method names.
 *
 * @example
 * const harness = new AfInputHarness(fixture.nativeElement);
 * expect(harness.getValue()).toBe('');
 * harness.setValue('hello');
 * expect(harness.getValue()).toBe('hello');
 */
export class AfInputHarness {
  private readonly hostEl: HTMLElement;

  constructor(container: HTMLElement) {
    const el = container.querySelector('af-input');
    if (!el) {
      throw new Error('AfInputHarness: af-input element not found in container.');
    }
    this.hostEl = el as HTMLElement;
  }

  /** Returns the inner native `<input>` element. */
  getInputElement(): HTMLInputElement {
    const input = this.hostEl.querySelector('input');
    if (!input) {
      throw new Error('AfInputHarness: inner <input> element not found.');
    }
    return input;
  }

  /** Returns the current value of the input. */
  getValue(): string {
    return this.getInputElement().value;
  }

  /** Sets the input value and dispatches an `input` event. */
  setValue(value: string): void {
    const input = this.getInputElement();
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  /** Returns the label text, or `null` if no label is rendered. */
  getLabel(): string | null {
    const label = this.hostEl.querySelector('.ct-field__label');
    return label?.textContent?.trim() ?? null;
  }

  /** Returns the hint text, or `null` if no hint is rendered. */
  getHint(): string | null {
    const hint = this.hostEl.querySelector('.ct-field__hint');
    return hint?.textContent?.trim() ?? null;
  }

  /** Returns the error text, or `null` if no error is rendered. */
  getError(): string | null {
    const error = this.hostEl.querySelector('.ct-field__error');
    return error?.textContent?.trim() ?? null;
  }

  /** Returns whether the input is disabled. */
  isDisabled(): boolean {
    return this.getInputElement().disabled;
  }

  /** Returns whether the input is required. */
  isRequired(): boolean {
    return this.getInputElement().required;
  }

  /** Returns whether `aria-invalid` is set to `"true"`. */
  isInvalid(): boolean {
    return this.getInputElement().getAttribute('aria-invalid') === 'true';
  }

  /** Returns the `type` attribute of the input. */
  getType(): string {
    return this.getInputElement().type;
  }

  /** Returns the `placeholder` attribute of the input. */
  getPlaceholder(): string {
    return this.getInputElement().placeholder;
  }

  /** Returns the `aria-describedby` attribute value, or `null` if absent. */
  getAriaDescribedBy(): string | null {
    return this.getInputElement().getAttribute('aria-describedby');
  }

  /** Focuses the input element. */
  focus(): void {
    this.getInputElement().focus();
  }

  /** Blurs the input element and dispatches a `blur` event. */
  blur(): void {
    this.getInputElement().dispatchEvent(new Event('blur', { bubbles: true }));
  }

  /** Returns the `id` attribute of the input. */
  getId(): string {
    return this.getInputElement().id;
  }

  /** Returns whether the field wrapper has the error modifier class. */
  hasFieldError(): boolean {
    return this.hostEl.querySelector('.ct-field--error') !== null;
  }

  /** Returns whether an icon wrapper is rendered. */
  hasIcon(): boolean {
    return this.hostEl.querySelector('.ct-input__icon') !== null;
  }

  /** Returns the full `class` attribute string of the inner input. */
  getClasses(): string {
    return this.getInputElement().className;
  }

  /** Returns whether the inner input has the given CSS class. */
  hasClass(className: string): boolean {
    return this.getInputElement().classList.contains(className);
  }
}

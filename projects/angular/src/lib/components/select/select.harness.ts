/**
 * Test harness for AfSelectComponent.
 *
 * Provides a semantic API for interacting with the native select in tests,
 * abstracting DOM details behind readable method names.
 *
 * @example
 * const harness = new AfSelectHarness(fixture.nativeElement);
 * expect(harness.isDisabled()).toBe(false);
 * harness.selectByIndex(1);
 * expect(harness.getValue()).toBe('Banana');
 */
export class AfSelectHarness {
  private readonly hostEl: HTMLElement;

  constructor(container: HTMLElement) {
    const el = container.querySelector('af-select');
    if (!el) {
      throw new Error('AfSelectHarness: af-select element not found in container.');
    }
    this.hostEl = el as HTMLElement;
  }

  /** Returns the native `<select>` element. */
  getSelectElement(): HTMLSelectElement {
    const select = this.hostEl.querySelector('select');
    if (!select) {
      throw new Error('AfSelectHarness: <select> element not found.');
    }
    return select;
  }

  /** Returns the current display value of the select. */
  getValue(): string {
    const select = this.getSelectElement();
    return select.options[select.selectedIndex]?.text?.trim() ?? '';
  }

  /** Returns the current selected index. */
  getSelectedIndex(): number {
    return this.getSelectElement().selectedIndex;
  }

  /** Selects an option by index and dispatches a change event. */
  selectByIndex(index: number): void {
    const select = this.getSelectElement();
    select.selectedIndex = index;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /** Returns the trimmed label text, or null if no label. */
  getLabel(): string | null {
    const label = this.hostEl.querySelector('.ct-field__label');
    return label?.textContent?.trim() ?? null;
  }

  /** Returns the trimmed hint text, or null if no hint. */
  getHint(): string | null {
    const hint = this.hostEl.querySelector('.ct-field__hint');
    return hint?.textContent?.trim() ?? null;
  }

  /** Returns the trimmed error text, or null if no error. */
  getError(): string | null {
    const error = this.hostEl.querySelector('.ct-field__error');
    return error?.textContent?.trim() ?? null;
  }

  /** Returns whether the select is disabled. */
  isDisabled(): boolean {
    return this.getSelectElement().disabled;
  }

  /** Returns whether the select is required. */
  isRequired(): boolean {
    return this.getSelectElement().required;
  }

  /** Returns whether `aria-invalid="true"` is set. */
  isInvalid(): boolean {
    return this.getSelectElement().getAttribute('aria-invalid') === 'true';
  }

  /** Returns the `aria-describedby` attribute value. */
  getAriaDescribedBy(): string | null {
    return this.getSelectElement().getAttribute('aria-describedby');
  }

  /** Returns the `aria-label` attribute value. */
  getAriaLabel(): string | null {
    return this.getSelectElement().getAttribute('aria-label');
  }

  /** Returns all `<option>` elements. */
  getOptions(): HTMLOptionElement[] {
    return Array.from(this.getSelectElement().options);
  }

  /** Returns the number of options (including placeholder). */
  getOptionCount(): number {
    return this.getSelectElement().options.length;
  }

  /** Returns the trimmed text of the option at the given index. */
  getOptionText(index: number): string {
    const options = this.getOptions();
    if (index < 0 || index >= options.length) {
      throw new Error(`AfSelectHarness: option index ${index} out of bounds (${options.length} options).`);
    }
    return options[index].text.trim();
  }

  /** Returns whether the option at the given index is disabled. */
  isOptionDisabled(index: number): boolean {
    return this.getOptions()[index]?.disabled ?? false;
  }

  /** Returns whether the option at the given index is selected. */
  isOptionSelected(index: number): boolean {
    return this.getOptions()[index]?.selected ?? false;
  }

  /** Returns the select element's ID. */
  getId(): string {
    return this.getSelectElement().id;
  }

  /** Returns whether the field wrapper has the error class. */
  hasFieldError(): boolean {
    return this.hostEl.querySelector('.ct-field--error') !== null;
  }

  /** Returns whether the select has the given CSS class. */
  hasClass(className: string): boolean {
    return this.getSelectElement().classList.contains(className);
  }

  /** Returns whether the `.ct-select-wrap` wrapper exists. */
  hasSelectWrap(): boolean {
    return this.hostEl.querySelector('.ct-select-wrap') !== null;
  }

  /** Dispatches a blur event on the select. */
  blur(): void {
    this.getSelectElement().dispatchEvent(new Event('blur', { bubbles: true }));
  }
}

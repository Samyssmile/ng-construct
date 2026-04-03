/**
 * Test harness for AfButtonComponent.
 *
 * Provides a semantic API for interacting with the button in tests,
 * abstracting DOM details behind readable method names.
 *
 * @example
 * const harness = new AfButtonHarness(fixture.nativeElement);
 * expect(harness.getText()).toBe('Save');
 * expect(harness.isDisabled()).toBe(false);
 * harness.click();
 */
export class AfButtonHarness {
  private readonly hostEl: HTMLElement;

  constructor(container: HTMLElement) {
    const el = container.querySelector('af-button');
    if (!el) {
      throw new Error('AfButtonHarness: af-button element not found in container.');
    }
    this.hostEl = el as HTMLElement;
  }

  /** Returns the inner native `<button>` element. */
  getButtonElement(): HTMLButtonElement {
    const btn = this.hostEl.querySelector('button');
    if (!btn) {
      throw new Error('AfButtonHarness: inner <button> element not found.');
    }
    return btn;
  }

  /** Returns the trimmed text content of the button. */
  getText(): string {
    return this.getButtonElement().textContent?.trim() ?? '';
  }

  /** Returns whether the button is disabled. */
  isDisabled(): boolean {
    return this.getButtonElement().disabled;
  }

  /** Clicks the inner button element. */
  click(): void {
    this.getButtonElement().click();
  }

  /** Returns the `aria-label` attribute value, or `null` if absent. */
  getAriaLabel(): string | null {
    return this.getButtonElement().getAttribute('aria-label');
  }

  /** Returns the `title` attribute value, or `null` if absent. */
  getTitle(): string | null {
    return this.getButtonElement().getAttribute('title');
  }

  /** Returns the `type` attribute of the button. */
  getType(): string {
    return this.getButtonElement().type;
  }

  /** Returns the full `class` attribute string of the inner button. */
  getClasses(): string {
    return this.getButtonElement().className;
  }

  /** Returns whether the inner button has the given CSS class. */
  hasClass(className: string): boolean {
    return this.getButtonElement().classList.contains(className);
  }
}

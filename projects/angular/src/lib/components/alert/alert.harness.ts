/**
 * Test harness for AfAlertComponent.
 *
 * Provides a semantic API for interacting with the alert in tests,
 * abstracting DOM details behind readable method names.
 *
 * @example
 * const harness = new AfAlertHarness(fixture.nativeElement);
 * expect(harness.getVariant()).toBe('info');
 * expect(harness.getRole()).toBe('status');
 * harness.dismiss();
 */
export class AfAlertHarness {
  private readonly hostEl: HTMLElement;

  constructor(container: HTMLElement) {
    const el = container.querySelector('af-alert');
    if (!el) {
      throw new Error(
        'AfAlertHarness: af-alert element not found in container.',
      );
    }
    this.hostEl = el as HTMLElement;
  }

  /** Returns the inner `.ct-alert` wrapper element, or `null` if the alert is not visible. */
  getAlertElement(): HTMLElement | null {
    return this.hostEl.querySelector('.ct-alert');
  }

  /** Returns the `data-variant` attribute value. Throws if the alert is not visible. */
  getVariant(): string {
    const el = this.requireVisible();
    return el.getAttribute('data-variant') ?? '';
  }

  /** Returns the ARIA `role` attribute value. Throws if the alert is not visible. */
  getRole(): string {
    const el = this.requireVisible();
    return el.getAttribute('role') ?? '';
  }

  /** Returns the full trimmed text content of the alert. Throws if not visible. */
  getText(): string {
    const el = this.requireVisible();
    return el.textContent?.trim() ?? '';
  }

  /** Returns the trimmed text content of the title slot. Throws if not visible. */
  getTitle(): string {
    const el = this.requireVisible();
    const title = el.querySelector('.ct-alert__title');
    return title?.textContent?.trim() ?? '';
  }

  /** Returns whether the alert is currently visible in the DOM. */
  isVisible(): boolean {
    return this.getAlertElement() !== null;
  }

  /** Returns whether the alert has a dismiss button. Throws if not visible. */
  isDismissible(): boolean {
    const el = this.requireVisible();
    return el.querySelector('.af-alert__dismiss') !== null;
  }

  /** Clicks the dismiss button. Throws if the alert is not visible or not dismissible. */
  dismiss(): void {
    const btn = this.getDismissButton();
    if (!btn) {
      throw new Error(
        'AfAlertHarness: dismiss button not found. Is the alert dismissible?',
      );
    }
    btn.click();
  }

  /** Returns the dismiss button element, or `null` if not present. */
  getDismissButton(): HTMLButtonElement | null {
    return (
      this.getAlertElement()?.querySelector<HTMLButtonElement>(
        '.af-alert__dismiss',
      ) ?? null
    );
  }

  /** Returns the `aria-live` region element for screen-reader announcements. */
  getLiveRegion(): HTMLElement | null {
    return this.hostEl.querySelector('[aria-live="polite"]');
  }

  private requireVisible(): HTMLElement {
    const el = this.getAlertElement();
    if (!el) {
      throw new Error('AfAlertHarness: alert is not visible.');
    }
    return el;
  }
}

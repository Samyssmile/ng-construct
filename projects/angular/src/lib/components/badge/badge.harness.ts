/**
 * Test harness for AfBadgeComponent.
 *
 * Provides a semantic API for querying badge state in tests,
 * abstracting DOM details behind readable method names.
 *
 * @example
 * const harness = new AfBadgeHarness(fixture.nativeElement);
 * expect(harness.getText()).toBe('Approved');
 * expect(harness.hasClass('ct-badge--success')).toBe(true);
 */
export class AfBadgeHarness {
  private readonly hostEl: HTMLElement;

  constructor(container: HTMLElement) {
    const el = container.querySelector('af-badge');
    if (!el) {
      throw new Error('AfBadgeHarness: af-badge element not found in container.');
    }
    this.hostEl = el as HTMLElement;
  }

  /** Returns the trimmed text content of the badge (projected content only). */
  getText(): string {
    return this.hostEl.textContent?.trim() ?? '';
  }

  /** Returns the full `class` attribute string of the host element. */
  getClasses(): string {
    return this.hostEl.className;
  }

  /** Returns whether the host element has the given CSS class. */
  hasClass(className: string): boolean {
    return this.hostEl.classList.contains(className);
  }

  /** Returns the `aria-label` attribute value, or `null` if absent. */
  getAriaLabel(): string | null {
    return this.hostEl.getAttribute('aria-label');
  }

  /** Returns the `role` attribute value, or `null` if absent. */
  getRole(): string | null {
    return this.hostEl.getAttribute('role');
  }

  /** Returns whether the badge contains an icon element. */
  hasIcon(): boolean {
    return this.hostEl.querySelector('.ct-badge__icon') !== null;
  }

  /** Returns whether the badge contains a dot indicator. */
  hasDot(): boolean {
    return this.hostEl.querySelector('.ct-badge__dot') !== null;
  }

  /** Returns the text content of the icon element, or empty string if absent. */
  getIconText(): string {
    return this.hostEl.querySelector('.ct-badge__icon')?.textContent?.trim() ?? '';
  }
}

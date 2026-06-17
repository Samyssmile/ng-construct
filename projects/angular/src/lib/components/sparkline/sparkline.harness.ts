/**
 * Test harness for AfSparklineComponent.
 *
 * Wraps DOM queries behind a semantic API so tests read intent, not selectors.
 *
 * @example
 * const harness = new AfSparklineHarness(fixture.nativeElement);
 * expect(harness.getLinePath()).toMatch(/^M/);
 * expect(harness.getDotCount()).toBe(1);
 */
export class AfSparklineHarness {
  private readonly hostEl: HTMLElement;

  constructor(container: HTMLElement) {
    const el = container.querySelector('af-sparkline');
    if (!el) {
      throw new Error('AfSparklineHarness: af-sparkline element not found in container.');
    }
    this.hostEl = el as HTMLElement;
  }

  /** Returns the sparkline `<svg>`, or null when the empty state is shown. */
  getSvg(): SVGSVGElement | null {
    return this.hostEl.querySelector('svg.ct-chart__svg');
  }

  /** Returns the SVG's `aria-label`. */
  getAriaLabel(): string | null {
    return this.getSvg()?.getAttribute('aria-label') ?? null;
  }

  /** Returns the line `<path>` `d` attribute, or null when empty. */
  getLinePath(): string | null {
    return this.hostEl.querySelector('.ct-chart__line')?.getAttribute('d') ?? null;
  }

  /** Returns whether an area fill is rendered. */
  hasArea(): boolean {
    return this.hostEl.querySelector('.ct-chart__area') !== null;
  }

  /** Returns the number of point markers (0 or 1). */
  getDotCount(): number {
    return this.hostEl.querySelectorAll('.ct-chart__dot').length;
  }

  /** Returns whether the empty-state message is shown. */
  isEmpty(): boolean {
    return this.hostEl.querySelector('.ct-chart__empty') !== null;
  }

  /** Returns the accessible data table element (always present when data exists). */
  getTable(): HTMLTableElement | null {
    return this.hostEl.querySelector('table.ct-chart__table');
  }

  /** Returns the number of data-table body rows. */
  getTableRowCount(): number {
    return this.hostEl.querySelectorAll('.ct-chart__table tbody tr').length;
  }
}

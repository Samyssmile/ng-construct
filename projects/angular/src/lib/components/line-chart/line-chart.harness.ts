/**
 * Test harness for AfLineChartComponent.
 *
 * Wraps DOM queries behind a semantic API so tests read intent, not selectors.
 *
 * @example
 * const harness = new AfLineChartHarness(fixture.nativeElement);
 * expect(harness.getSeriesCount()).toBe(2);
 * harness.toggleTable();
 * expect(harness.isTableVisible()).toBe(true);
 */
export class AfLineChartHarness {
  private readonly hostEl: HTMLElement;

  constructor(container: HTMLElement) {
    const el = container.querySelector('af-line-chart');
    if (!el) {
      throw new Error('AfLineChartHarness: af-line-chart element not found in container.');
    }
    this.hostEl = el as HTMLElement;
  }

  /** Returns the chart `<svg>`, or null when the empty state is shown. */
  getSvg(): SVGSVGElement | null {
    return this.hostEl.querySelector('svg.ct-chart__svg');
  }

  /** Returns the SVG's `aria-label`. */
  getAriaLabel(): string | null {
    return this.getSvg()?.getAttribute('aria-label') ?? null;
  }

  /** Returns the number of rendered series groups. */
  getSeriesCount(): number {
    return this.hostEl.querySelectorAll('svg .ct-chart__line').length;
  }

  /** Returns all line `<path>` `d` attributes. */
  getLinePaths(): string[] {
    return Array.from(this.hostEl.querySelectorAll('.ct-chart__line')).map(
      (p) => p.getAttribute('d') ?? '',
    );
  }

  /** Returns the number of area fills (0 unless `area` is enabled). */
  getAreaCount(): number {
    return this.hostEl.querySelectorAll('.ct-chart__area').length;
  }

  /** Returns the number of point markers. */
  getDotCount(): number {
    return this.hostEl.querySelectorAll('.ct-chart__dot').length;
  }

  /** Returns the legend labels in order. */
  getLegendLabels(): string[] {
    return Array.from(this.hostEl.querySelectorAll('.ct-chart__legend-item')).map(
      (li) => li.textContent?.trim() ?? '',
    );
  }

  /** Returns the rendered y-axis tick labels. */
  getYTickLabels(): string[] {
    return Array.from(this.hostEl.querySelectorAll('.ct-chart__tick-label'))
      .filter((t) => t.getAttribute('text-anchor') === 'end')
      .map((t) => t.textContent?.trim() ?? '');
  }

  /** Returns whether the empty-state message is shown. */
  isEmpty(): boolean {
    return this.hostEl.querySelector('.ct-chart__empty') !== null;
  }

  /** Returns the accessible data table element (always present when data exists). */
  getTable(): HTMLTableElement | null {
    return this.hostEl.querySelector('table.ct-chart__table');
  }

  /** Returns the data-table header cell texts. */
  getTableHeaders(): string[] {
    return Array.from(this.hostEl.querySelectorAll('.ct-chart__table thead th')).map(
      (th) => th.textContent?.trim() ?? '',
    );
  }

  /** Returns the number of data-table body rows. */
  getTableRowCount(): number {
    return this.hostEl.querySelectorAll('.ct-chart__table tbody tr').length;
  }

  /** Returns the toggle button that reveals/hides the data table. */
  getToggle(): HTMLButtonElement | null {
    return this.hostEl.querySelector('button.ct-chart__toggle');
  }

  /** Clicks the data-table toggle button. */
  toggleTable(): void {
    this.getToggle()?.click();
  }

  /** Returns whether the data table is visually revealed. */
  isTableVisible(): boolean {
    return this.hostEl.querySelector('.ct-chart--show-table') !== null;
  }
}

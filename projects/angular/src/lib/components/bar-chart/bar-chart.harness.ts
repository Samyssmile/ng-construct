/**
 * Test harness for AfBarChartComponent.
 *
 * Wraps DOM queries behind a semantic API so tests read intent, not selectors.
 *
 * @example
 * const harness = new AfBarChartHarness(fixture.nativeElement);
 * expect(harness.getBarCount()).toBe(5);
 * harness.toggleTable();
 * expect(harness.isTableVisible()).toBe(true);
 */
export class AfBarChartHarness {
  private readonly hostEl: HTMLElement;

  constructor(container: HTMLElement) {
    const el = container.querySelector('af-bar-chart');
    if (!el) {
      throw new Error('AfBarChartHarness: af-bar-chart element not found in container.');
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

  /** Returns the total number of rendered bar rects. */
  getBarCount(): number {
    return this.getBars().length;
  }

  /** Returns all bar `<rect>` elements in DOM order. */
  getBars(): SVGRectElement[] {
    return Array.from(this.hostEl.querySelectorAll('rect.ct-chart__bar'));
  }

  /** Returns the legend labels in order. */
  getLegendLabels(): string[] {
    return Array.from(this.hostEl.querySelectorAll('.ct-chart__legend-item')).map(
      (li) => li.textContent?.trim() ?? '',
    );
  }

  /** Returns the rendered value-axis tick labels (orientation-independent). */
  getValueTickLabels(): string[] {
    return Array.from(
      this.hostEl.querySelectorAll('.ct-chart__value-ticks .ct-chart__tick-label'),
    ).map((t) => t.textContent?.trim() ?? '');
  }

  /** Returns the rendered category-axis labels in order. */
  getCategoryLabels(): string[] {
    return Array.from(
      this.hostEl.querySelectorAll('.ct-chart__category-labels .ct-chart__tick-label'),
    ).map((t) => t.textContent?.trim() ?? '');
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

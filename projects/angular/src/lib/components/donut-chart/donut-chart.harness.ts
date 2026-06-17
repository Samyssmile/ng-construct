/**
 * Test harness for AfDonutChartComponent.
 *
 * Wraps DOM queries behind a semantic API so tests read intent, not selectors.
 *
 * @example
 * const harness = new AfDonutChartHarness(fixture.nativeElement);
 * expect(harness.getSliceCount()).toBe(2);
 * harness.toggleTable();
 * expect(harness.isTableVisible()).toBe(true);
 */
export class AfDonutChartHarness {
  private readonly hostEl: HTMLElement;

  constructor(container: HTMLElement) {
    const el = container.querySelector('af-donut-chart');
    if (!el) {
      throw new Error('AfDonutChartHarness: af-donut-chart element not found in container.');
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

  /** Returns the number of rendered (non-zero) ring slices. */
  getSliceCount(): number {
    return this.hostEl.querySelectorAll('.ct-chart__slice').length;
  }

  /** Returns all slice `<path>` `d` attributes. */
  getSlicePaths(): string[] {
    return Array.from(this.hostEl.querySelectorAll('.ct-chart__slice')).map(
      (p) => p.getAttribute('d') ?? '',
    );
  }

  /** Returns the big centre value text, or null in pie mode (no centre text). */
  getCenterValue(): string | null {
    return this.hostEl.querySelector('.ct-chart__donut-value')?.textContent?.trim() ?? null;
  }

  /** Returns the small centre caption text, or null when none is rendered. */
  getCenterLabel(): string | null {
    return this.hostEl.querySelector('.ct-chart__donut-label')?.textContent?.trim() ?? null;
  }

  /** Returns the legend item texts in order (label plus optional percent). */
  getLegendLabels(): string[] {
    return Array.from(this.hostEl.querySelectorAll('.ct-chart__legend-item')).map(
      (li) => li.textContent?.trim().replace(/\s+/g, ' ') ?? '',
    );
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

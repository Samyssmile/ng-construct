/**
 * Test harness for AfGaugeComponent.
 *
 * Wraps DOM queries behind a semantic API so tests read intent, not selectors.
 *
 * @example
 * const harness = new AfGaugeHarness(fixture.nativeElement);
 * expect(harness.getRole()).toBe('meter');
 * expect(harness.getAriaValueNow()).toBe('82');
 */
export class AfGaugeHarness {
  private readonly hostEl: HTMLElement;

  constructor(container: HTMLElement) {
    const el = container.querySelector('af-gauge');
    if (!el) {
      throw new Error('AfGaugeHarness: af-gauge element not found in container.');
    }
    this.hostEl = el as HTMLElement;
  }

  /** Returns the `.ct-chart` root that carries the `meter` role and value attributes. */
  getRoot(): HTMLElement | null {
    return this.hostEl.querySelector('.ct-chart');
  }

  /** Returns the root's `role` (`'meter'` with data, null in the empty state). */
  getRole(): string | null {
    return this.getRoot()?.getAttribute('role') ?? null;
  }

  /** Returns the `aria-valuenow` of the meter root. */
  getAriaValueNow(): string | null {
    return this.getRoot()?.getAttribute('aria-valuenow') ?? null;
  }

  /** Returns the `aria-valuemin` of the meter root. */
  getAriaValueMin(): string | null {
    return this.getRoot()?.getAttribute('aria-valuemin') ?? null;
  }

  /** Returns the `aria-valuemax` of the meter root. */
  getAriaValueMax(): string | null {
    return this.getRoot()?.getAttribute('aria-valuemax') ?? null;
  }

  /** Returns the human-readable `aria-valuetext` of the meter root. */
  getAriaValueText(): string | null {
    return this.getRoot()?.getAttribute('aria-valuetext') ?? null;
  }

  /** Returns the `aria-label` of the meter root. */
  getAriaLabel(): string | null {
    return this.getRoot()?.getAttribute('aria-label') ?? null;
  }

  /** Returns the decorative `<svg>`, or null when the empty state is shown. */
  getSvg(): SVGSVGElement | null {
    return this.hostEl.querySelector('svg.ct-chart__svg');
  }

  /** Returns the track arc `<path>`. */
  getTrackPath(): SVGPathElement | null {
    return this.hostEl.querySelector('path.ct-chart__gauge-track');
  }

  /** Returns the value arc `<path>` (absent when the value fraction is zero). */
  getValuePath(): SVGPathElement | null {
    return this.hostEl.querySelector('path.ct-chart__gauge-value');
  }

  /** Returns the `--status` modifier on the value arc (e.g. `'success'`), or null. */
  getValueStatusClass(): string | null {
    const path = this.getValuePath();
    if (!path) return null;
    const modifier = Array.from(path.classList).find((c) =>
      c.startsWith('ct-chart__gauge-value--'),
    );
    return modifier ? modifier.replace('ct-chart__gauge-value--', '') : null;
  }

  /** Returns the centre value text, or null when the value text is hidden. */
  getCenterText(): string | null {
    return this.hostEl.querySelector('.ct-chart__gauge-text')?.textContent?.trim() ?? null;
  }

  /** Returns the caption text below the value, or null when absent. */
  getCaption(): string | null {
    return this.hostEl.querySelector('.ct-chart__gauge-caption')?.textContent?.trim() ?? null;
  }

  /** Returns whether the empty-state message is shown. */
  isEmpty(): boolean {
    return this.hostEl.querySelector('.ct-chart__empty') !== null;
  }
}

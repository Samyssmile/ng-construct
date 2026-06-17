import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { AF_CHART_I18N } from '../chart/chart.i18n';
import { AfChartStatus, AfGaugeThreshold } from '../chart/chart.types';
import { arcPath, clamp, formatNumber, roundTo } from '../../utils/chart-geometry';

/** Inset (in viewBox units) so the arc stroke is never clipped at the viewBox edge. */
const PAD = 4;

/** Fixed viewBox width — the gauge keeps a square-ish aspect and scales fluidly. */
const VIEW_WIDTH = 240;

/** A full sweep can't be drawn as one arc; clamp the end angle just shy of 360°. */
const MAX_RING_ANGLE = 359.999;

/** Resolved geometry for the gauge, derived in a single pass. */
interface GaugePlot {
  /** Centre x in viewBox units. */
  cx: number;
  /** Centre y in viewBox units. */
  cy: number;
  /** Background track arc path (`M`/`A`). */
  track: string;
  /** Foreground value arc path (`M`/`A`); `''` when the fraction is zero. */
  value: string;
  /** Baseline y for the centre value/caption text block. */
  textY: number;
}

/**
 * Accessible single-value gauge for progress, compliance and utilisation metrics.
 *
 * Renders one metric as an SVG ring (full 360° track) or bottom-opening semi
 * gauge, with the value drawn as a coloured arc over a muted track and the
 * formatted number at the centre. Geometry is computed with the SSR-safe
 * `chart-geometry` helpers — no DOM, `window` or `Date` access — so it renders
 * identically on the server.
 *
 * The arc colour follows {@link AfGaugeThreshold} bands (the highest `from` ≤
 * value wins) or the explicit {@link status} input when no band matches.
 *
 * @example Compliance ring
 * <af-gauge ariaLabel="Compliance score" [value]="82" valueText="82%" caption="Compliance" />
 *
 * @example Utilisation with thresholds
 * <af-gauge
 *   ariaLabel="Quota utilisation"
 *   [value]="95"
 *   valueText="95%"
 *   [thresholds]="[
 *     { from: 0, status: 'success' },
 *     { from: 80, status: 'warning' },
 *     { from: 90, status: 'danger' },
 *   ]" />
 *
 * @accessibility
 * - Because a gauge conveys a single metric, the root element uses the WAI-ARIA
 *   `meter` role with `aria-valuenow` / `aria-valuemin` / `aria-valuemax` and an
 *   `aria-valuetext` carrying the human-readable value (e.g. `"82%"`). This is
 *   more semantic than the data-table fallback used by the multi-value charts,
 *   so no table is rendered here.
 * - The SVG is purely decorative (`aria-hidden="true"`, `focusable="false"`);
 *   the meter role carries everything assistive technology needs.
 * - The centre value text mirrors `aria-valuetext`, so colour is never the sole
 *   carrier of meaning (WCAG 1.4.1); the status colours come from the
 *   contrast-checked `--color-state-*` tokens.
 * - The empty/invalid state (`max <= min`) drops the `meter` role and exposes a
 *   `role="status"` message instead, so the meter is never invalid.
 * - All user-facing strings are configurable via {@link AF_CHART_I18N}.
 */
@Component({
  selector: 'af-gauge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
  template: `
    <div
      class="ct-chart"
      [style.--ct-chart-gauge-width]="gaugeWidth()"
      [attr.role]="isEmpty() ? null : 'meter'"
      [attr.aria-label]="isEmpty() ? null : ariaLabel()"
      [attr.aria-valuenow]="isEmpty() ? null : clampedValue()"
      [attr.aria-valuemin]="isEmpty() ? null : min()"
      [attr.aria-valuemax]="isEmpty() ? null : max()"
      [attr.aria-valuetext]="isEmpty() ? null : valueDisplay()">
      <figure class="ct-chart__figure">
        @if (isEmpty()) {
          <div class="ct-chart__empty" role="status">{{ i18n.noData }}</div>
        } @else {
          <svg
            class="ct-chart__svg"
            [attr.viewBox]="viewBox()"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
            focusable="false">
            <path class="ct-chart__gauge-track" [attr.d]="plot().track" />
            @if (plot().value) {
              <path [class]="valueClass()" [attr.d]="plot().value" />
            }
            @if (showValue()) {
              <text
                class="ct-chart__gauge-text"
                [attr.x]="plot().cx"
                [attr.y]="plot().textY"
                text-anchor="middle"
                dominant-baseline="middle">
                {{ valueDisplay() }}
              </text>
              @if (caption()) {
                <text
                  class="ct-chart__gauge-caption"
                  [attr.x]="plot().cx"
                  [attr.y]="plot().textY + 22"
                  text-anchor="middle"
                  dominant-baseline="middle">
                  {{ caption() }}
                </text>
              }
            }
          </svg>
        }
      </figure>
    </div>
  `,
})
export class AfGaugeComponent {
  protected readonly i18n = inject(AF_CHART_I18N);

  /** Accessible label for the gauge (required by the WAI-ARIA `meter` role). */
  ariaLabel = input.required<string>();
  /**
   * The metric value. Clamped into `[min, max]` for the drawn arc and
   * `aria-valuenow`; `aria-valuetext` reports the raw value unchanged.
   */
  value = input.required<number>();
  /** Lower bound of the gauge scale. */
  min = input(0);
  /** Upper bound of the gauge scale. */
  max = input(100);
  /**
   * Colour threshold bands. The band with the highest `from` ≤ `value` selects
   * the arc's `status`; if none match (or the list is empty), {@link status} is used.
   */
  thresholds = input<AfGaugeThreshold[]>([]);
  /** Explicit colour bucket; overridden by a matching {@link thresholds} band. */
  status = input<AfChartStatus>('default');
  /** `'ring'` = full 360° track; `'semi'` = bottom-opening 180° half gauge. */
  shape = input<'ring' | 'semi'>('ring');
  /** Centre/`aria-valuetext` override; defaults to the locale-formatted `value`. */
  valueText = input('');
  /** Small caption rendered beneath the value (e.g. the metric name). */
  caption = input('');
  /** Arc thickness in viewBox units; drives both the arc radius and the rendered stroke. */
  strokeWidth = input(14);
  /** Render the centre value (and caption) text. */
  showValue = input(true, { transform: booleanAttribute });
  /** BCP-47 locale for the default value formatting (e.g. `'de-DE'`). */
  locale = input<string>();
  /** `Intl.NumberFormat` options for the default value formatting. */
  valueFormat = input<Intl.NumberFormatOptions>();
  /** Gauge height in viewBox units (width scales fluidly to the container). */
  height = input(200);

  /** True when the scale is degenerate (`max <= min`) — renders the empty state. */
  protected readonly isEmpty = computed(() => this.max() <= this.min());

  protected readonly viewBox = computed(() => `0 0 ${VIEW_WIDTH} ${this.height()}`);

  /** Human-readable value: the explicit override or the locale-formatted number. */
  protected readonly valueDisplay = computed(
    () => this.valueText() || formatNumber(this.value(), this.locale(), this.valueFormat()),
  );

  /**
   * `value` clamped into `[min, max]` for `aria-valuenow`. The WAI-ARIA `meter`
   * role requires `valuenow ∈ [valuemin, valuemax]`; `aria-valuetext` keeps the
   * raw reading so assistive tech still announces an out-of-range value verbatim.
   */
  protected readonly clampedValue = computed(() => clamp(this.value(), this.min(), this.max()));

  /** Arc thickness as a CSS length, fed to the `--ct-chart-gauge-width` token. */
  protected readonly gaugeWidth = computed(() => `${this.strokeWidth()}px`);

  /**
   * Resolved status bucket: the highest threshold band whose `from <= value`,
   * falling back to the explicit {@link status} input.
   */
  private readonly resolvedStatus = computed<AfChartStatus>(() => {
    const value = this.value();
    const sorted = [...this.thresholds()].sort((a, b) => a.from - b.from);
    let match: AfChartStatus | null = null;
    for (const band of sorted) {
      if (band.from <= value) match = band.status;
    }
    return match ?? this.status();
  });

  protected readonly valueClass = computed(
    () => `ct-chart__gauge-value ct-chart__gauge-value--${this.resolvedStatus()}`,
  );

  /** All geometry needed by the template, derived in a single pass. */
  protected readonly plot = computed<GaugePlot>(() => {
    const height = this.height();
    const isSemi = this.shape() === 'semi';
    const cx = VIEW_WIDTH / 2;
    const radius = Math.min(VIEW_WIDTH, height) / 2 - this.strokeWidth() / 2 - PAD;
    const span = this.max() - this.min();
    const fraction = span > 0 ? clamp((this.value() - this.min()) / span, 0, 1) : 0;

    if (isSemi) {
      // Bottom-opening half gauge: angles increase clockwise from -90° (9 o'clock)
      // over the top (0°) to +90° (3 o'clock). Centre the arc vertically.
      const cy = height / 2 + radius / 2;
      const valueEnd = -90 + 180 * fraction;
      return {
        cx: roundTo(cx, 2),
        cy: roundTo(cy, 2),
        track: arcPath(cx, cy, radius, -90, 90),
        value: fraction > 0 ? arcPath(cx, cy, radius, -90, valueEnd) : '',
        textY: roundTo(cy - radius / 6, 2),
      };
    }

    // Full ring: track is a closed circle; value sweeps clockwise from 12 o'clock.
    const cy = height / 2;
    const valueEnd = Math.min(360 * fraction, MAX_RING_ANGLE);
    return {
      cx: roundTo(cx, 2),
      cy: roundTo(cy, 2),
      track: arcPath(cx, cy, radius, 0, MAX_RING_ANGLE),
      value: fraction > 0 ? arcPath(cx, cy, radius, 0, valueEnd) : '',
      textY: roundTo(cy, 2),
    };
  });
}

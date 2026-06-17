import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { AfChartDataTableComponent } from '../chart/chart-data-table.component';
import { AF_CHART_I18N } from '../chart/chart.i18n';
import { AfChartTableModel } from '../chart/chart.types';
import {
  ChartPoint,
  buildAreaPath,
  buildLinePath,
  formatNumber,
  roundTo,
  scaleLinear,
} from '../../utils/chart-geometry';

/** Inset (in viewBox units) so the stroke and the last-point dot are never clipped. */
const PAD = 2;

/** Default series colour token used when no explicit `color` is provided. */
const DEFAULT_COLOR = 'var(--color-chart-series-1)';

/** Fallback summary template used when {@link AF_CHART_I18N} omits `sparklineSummary`. */
const DEFAULT_SUMMARY = '{label}: {count} points, min {min}, max {max}, latest {last}.';

/** Resolved geometry for the sparkline, derived in a single pass. */
interface SparklinePlot {
  /** SVG `M`/`L` path through every point. */
  line: string;
  /** Closed area path down to the baseline, or `''` when `area` is off. */
  area: string;
  /** Final point, used to position the last-point marker. */
  lastDot: ChartPoint | null;
}

/**
 * Tiny inline trend line (sparkline) for KPI tiles and dense tables.
 *
 * Renders a compact SVG line — optionally filled and with a marker on the final
 * point — at a fixed small size (it does not stretch to its container). Geometry
 * is computed with the SSR-safe `chart-geometry` helpers — no DOM, `window` or
 * `Date` access — so it renders identically on the server.
 *
 * Because a sparkline is too small for axes, a legend or a visible toggle, the
 * trend is summarised in the SVG's `aria-label` and the exact values are always
 * available through a visually-hidden data-table fallback.
 *
 * @example KPI tile trend
 * <af-sparkline ariaLabel="Sign-ups, last 14 days" [values]="signups" />
 *
 * @example Filled sparkline without the end marker
 * <af-sparkline
 *   ariaLabel="Latency, last hour"
 *   [values]="latency"
 *   [area]="true"
 *   [showLastDot]="false" />
 *
 * @accessibility
 * - The SVG carries `role="img"` and an `aria-label` that conveys the trend
 *   (point count, min, max and latest value) plus a pointer to the data table.
 * - A visually-hidden {@link AfChartDataTableComponent} mirrors every value so
 *   information is never conveyed by colour or shape alone (WCAG 1.4.1).
 * - The series colour defaults to the contrast-checked `--color-chart-series-1`
 *   token; colour is never the sole carrier of meaning.
 * - All user-facing strings are configurable via {@link AF_CHART_I18N}.
 */
@Component({
  selector: 'af-sparkline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AfChartDataTableComponent],
  host: { style: 'display: inline-block' },
  template: `
    <div class="ct-chart ct-chart--sparkline">
      @if (hasData()) {
        <svg
          class="ct-chart__svg"
          [attr.width]="width()"
          [attr.height]="height()"
          [attr.viewBox]="viewBox()"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          [attr.aria-label]="svgAriaLabel()">
          <g [style.color]="resolvedColor()">
            @if (area()) {
              <path class="ct-chart__area" [attr.d]="plot().area" />
            }
            <path class="ct-chart__line" [attr.d]="plot().line" />
            @if (showLastDot() && plot().lastDot; as dot) {
              <circle class="ct-chart__dot" [attr.cx]="dot.x" [attr.cy]="dot.y" r="2.5" />
            }
          </g>
        </svg>

        <div class="ct-chart__table-wrap">
          <af-chart-data-table [model]="tableModel()" />
        </div>
      } @else {
        <span class="ct-chart__empty" role="status">{{ i18n.noData }}</span>
      }
    </div>
  `,
})
export class AfSparklineComponent {
  protected readonly i18n = inject(AF_CHART_I18N);

  /** Accessible chart label (required by the WAI-ARIA `img` role). */
  ariaLabel = input.required<string>();
  /** The numeric series to plot. `null` entries are skipped in the geometry. */
  values = input.required<number[]>();
  /** Optional labels for the data-table fallback; falls back to 1-based indices. */
  categories = input<string[]>([]);
  /** Fill the area beneath the line. */
  area = input(false, { transform: booleanAttribute });
  /** Render a marker on the final point. */
  showLastDot = input(true, { transform: booleanAttribute });
  /** Explicit CSS colour; defaults to `--color-chart-series-1`. */
  color = input<string>();
  /** SVG width in viewBox units (the sparkline keeps this compact size). */
  width = input(120);
  /** SVG height in viewBox units (the sparkline keeps this compact size). */
  height = input(32);
  /** BCP-47 locale for number formatting (e.g. `'de-DE'`). */
  locale = input<string>();
  /** `Intl.NumberFormat` options for the aria-label and data-table values. */
  valueFormat = input<Intl.NumberFormatOptions>();

  /** Numeric values with `null`/`NaN` entries removed — drives geometry and the summary. */
  private readonly numericValues = computed(() =>
    this.values().filter((v): v is number => v != null && !Number.isNaN(v)),
  );

  protected readonly hasData = computed(() => this.numericValues().length > 0);

  protected readonly resolvedColor = computed(() => this.color() || DEFAULT_COLOR);

  protected readonly viewBox = computed(() => `0 0 ${this.width()} ${this.height()}`);

  /** Trend-describing label: count, min, max and latest value, plus the table pointer. */
  protected readonly svgAriaLabel = computed(() => {
    const values = this.numericValues();
    const count = values.length;
    const summary = (this.i18n.sparklineSummary ?? DEFAULT_SUMMARY)
      .replace('{label}', this.ariaLabel())
      .replace('{count}', String(count))
      .replace('{min}', this.format(Math.min(...values)))
      .replace('{max}', this.format(Math.max(...values)))
      .replace('{last}', this.format(values[count - 1]));
    return `${summary} ${this.i18n.tableSuffix}`;
  });

  /** All geometry needed by the template, derived in a single pass. */
  protected readonly plot = computed<SparklinePlot>(() => {
    const values = this.numericValues();
    const width = this.width();
    const height = this.height();

    const left = PAD;
    const right = width - PAD;
    const top = PAD;
    const bottom = height - PAD;

    const dataMin = Math.min(...values);
    const dataMax = Math.max(...values);
    const yScale = scaleLinear(dataMin, dataMax, bottom, top);

    const xAt = (i: number) =>
      values.length <= 1
        ? (left + right) / 2
        : left + (i / (values.length - 1)) * (right - left);

    const points: ChartPoint[] = values.map((v, i) => ({
      x: roundTo(xAt(i), 2),
      y: roundTo(yScale(v), 2),
    }));

    return {
      line: buildLinePath(points),
      area: this.area() ? buildAreaPath(points, bottom) : '',
      lastDot: points[points.length - 1] ?? null,
    };
  });

  protected readonly tableModel = computed<AfChartTableModel>(() => {
    const values = this.values();
    const categories = this.categories();
    return {
      caption: this.ariaLabel(),
      headers: [this.i18n.categoryHeader, this.i18n.valueHeader],
      rows: values.map((v, i) => [
        categories[i] ?? String(i + 1),
        v == null ? '—' : this.format(v),
      ]),
    };
  });

  private format(value: number): string {
    return formatNumber(value, this.locale(), this.valueFormat());
  }
}

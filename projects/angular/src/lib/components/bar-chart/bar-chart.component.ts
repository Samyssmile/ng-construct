import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { AfChartDataTableComponent } from '../chart/chart-data-table.component';
import { AF_CHART_I18N } from '../chart/chart.i18n';
import {
  AF_CHART_PALETTE_SIZE,
  AfBarLayout,
  AfChartSeries,
  AfChartTableModel,
} from '../chart/chart.types';
import { formatNumber, niceScale, roundTo, scaleLinear } from '../../utils/chart-geometry';

/** A single rendered bar rectangle in SVG user space, with its accessible title. */
interface PlotBar {
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
}

/** Resolved geometry for a single series: its colour and the bars to render. */
interface SeriesGeom {
  name: string;
  color: string;
  bars: PlotBar[];
}

/** A value-axis grid line plus its tick label, pre-positioned for the active orientation. */
interface ValueTick {
  value: number;
  label: string;
  /** Grid-line endpoints. */
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Tick-label anchor. */
  labelX: number;
  labelY: number;
}

/** A category-axis label, pre-positioned and anchored for the active orientation. */
interface CategoryLabel {
  label: string;
  x: number;
  y: number;
}

/** Endpoints of the zero/axis line. */
interface AxisLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** Everything the template needs, derived in a single SSR-safe pass. */
interface Plot {
  series: SeriesGeom[];
  valueTicks: ValueTick[];
  categoryLabels: CategoryLabel[];
  axisLine: AxisLine;
  /** Anchor for value-tick labels: `'end'` (vertical) or `'middle'` (horizontal). */
  valueLabelAnchor: 'end' | 'middle';
  /** Anchor for category labels: `'middle'` (vertical) or `'end'` (horizontal). */
  categoryLabelAnchor: 'middle' | 'end';
}

let nextBarChartUid = 0;

const VIEW_WIDTH = 640;
const MARGIN = { top: 12, right: 16, bottom: 28, left: 48 };
/** Wider left gutter in horizontal mode to fit right-aligned category labels. */
const HORIZONTAL_LEFT = 96;
/** Fraction of each category band reserved as padding (grouped/stacked, non-histogram). */
const BAND_PADDING = 0.2;

/**
 * Accessible bar chart for categorical comparisons and distributions.
 *
 * Renders one or more {@link AfChartSeries} over a shared category axis as SVG
 * `<rect>` bars. Supports grouped and stacked layouts, vertical and horizontal
 * orientations, and a gap-free histogram mode for distributions. All geometry is
 * computed with the SSR-safe `chart-geometry` helpers — no DOM, `window`, or
 * `Date` access — so it renders identically on the server.
 *
 * @example Single-series vertical bars
 * <af-bar-chart
 *   ariaLabel="Tickets by status"
 *   [categories]="statuses"
 *   [series]="[{ name: 'Tickets', values: counts }]" />
 *
 * @example Grouped multi-series
 * <af-bar-chart
 *   ariaLabel="Cost by origin and week"
 *   [categories]="weeks"
 *   [series]="[
 *     { name: 'Analyzer', values: analyzer },
 *     { name: 'Resolver', values: resolver },
 *   ]"
 *   layout="grouped" />
 *
 * @example Horizontal ranked list
 * <af-bar-chart
 *   ariaLabel="Top organisations"
 *   [categories]="orgs"
 *   [series]="[{ name: 'Documents', values: docs }]"
 *   orientation="horizontal" />
 *
 * @accessibility
 * - The SVG carries `role="img"` and an `aria-label` describing the chart, with
 *   a pointer to the always-present data-table fallback.
 * - A visually-hidden {@link AfChartDataTableComponent} mirrors every value so
 *   information is never conveyed by colour alone (WCAG 1.4.1); a toggle reveals it.
 * - Each series is labelled in the legend and each bar carries a `<title>`, so
 *   colour is never the sole carrier.
 * - Series colours come from the contrast-checked `--color-chart-series-*` tokens.
 * - All user-facing strings are configurable via {@link AF_CHART_I18N}.
 */
@Component({
  selector: 'af-bar-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AfChartDataTableComponent],
  host: { style: 'display: block' },
  template: `
    <div class="ct-chart" [class.ct-chart--show-table]="tableVisible()">
      <figure class="ct-chart__figure">
        @if (hasData()) {
          <div class="ct-chart__toolbar">
            <button
              type="button"
              class="ct-chart__toggle"
              [attr.aria-expanded]="tableVisible()"
              [attr.aria-controls]="tableId"
              (click)="toggleTable()">
              {{ tableVisible() ? i18n.hideTable : i18n.showTable }}
            </button>
          </div>

          <svg
            class="ct-chart__svg"
            [attr.viewBox]="viewBox()"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            [attr.aria-label]="svgAriaLabel()">
            <g class="ct-chart__value-ticks">
              @for (tick of plot().valueTicks; track tick.value) {
                <line
                  class="ct-chart__grid-line"
                  [attr.x1]="tick.x1"
                  [attr.y1]="tick.y1"
                  [attr.x2]="tick.x2"
                  [attr.y2]="tick.y2" />
                <text
                  class="ct-chart__tick-label"
                  [attr.x]="tick.labelX"
                  [attr.y]="tick.labelY"
                  [attr.text-anchor]="plot().valueLabelAnchor"
                  dominant-baseline="middle">
                  {{ tick.label }}
                </text>
              }
            </g>

            <line
              class="ct-chart__axis-line"
              [attr.x1]="plot().axisLine.x1"
              [attr.y1]="plot().axisLine.y1"
              [attr.x2]="plot().axisLine.x2"
              [attr.y2]="plot().axisLine.y2" />

            <g class="ct-chart__category-labels">
              @for (label of plot().categoryLabels; track $index) {
                <text
                  class="ct-chart__tick-label"
                  [attr.x]="label.x"
                  [attr.y]="label.y"
                  [attr.text-anchor]="plot().categoryLabelAnchor"
                  dominant-baseline="middle">
                  {{ label.label }}
                </text>
              }
            </g>

            @for (s of plot().series; track s.name) {
              <g [style.color]="s.color">
                @for (bar of s.bars; track $index) {
                  <rect
                    class="ct-chart__bar"
                    [attr.x]="bar.x"
                    [attr.y]="bar.y"
                    [attr.width]="bar.width"
                    [attr.height]="bar.height">
                    <title>{{ bar.title }}</title>
                  </rect>
                }
              </g>
            }
          </svg>

          @if (legendVisible()) {
            <ul class="ct-chart__legend">
              @for (item of legend(); track item.name) {
                <li class="ct-chart__legend-item" [style.color]="item.color">
                  <span class="ct-chart__legend-marker" aria-hidden="true"></span>
                  <span>{{ item.name }}</span>
                </li>
              }
            </ul>
          }

          <div class="ct-chart__table-wrap" [id]="tableId">
            <af-chart-data-table [model]="tableModel()" />
          </div>
        } @else {
          <div class="ct-chart__empty" role="status">{{ i18n.noData }}</div>
        }
      </figure>
    </div>
  `,
})
export class AfBarChartComponent {
  protected readonly i18n = inject(AF_CHART_I18N);
  protected readonly tableId = `af-bar-chart-${nextBarChartUid++}`;

  /** Accessible chart label (required by the WAI-ARIA `img` role). */
  ariaLabel = input.required<string>();
  /** Category-axis labels. Series values align 1:1 with these. */
  categories = input.required<string[]>();
  /** One or more data series sharing the category axis. A `null` value renders no bar. */
  series = input.required<AfChartSeries[]>();
  /** How multiple series are arranged: side-by-side (`grouped`) or stacked. */
  layout = input<AfBarLayout>('grouped');
  /** Bar direction: `vertical` columns or `horizontal` rows (ideal for ranked label lists). */
  orientation = input<'vertical' | 'horizontal'>('vertical');
  /** Render contiguous, gap-free bars for distributions (typically single-series). */
  histogram = input(false, { transform: booleanAttribute });
  /** Show the series legend. */
  showLegend = input(true, { transform: booleanAttribute });
  /** Show the legend even when there is only one series (hidden by default in that case). */
  showLegendForSingle = input(false, { transform: booleanAttribute });
  /** Chart height in viewBox units (width is the fluid 640). */
  height = input(280);
  /** Force the value-axis maximum; defaults to a nice value derived from the data. */
  valueMax = input<number | null>(null);
  /** BCP-47 locale for number formatting (e.g. `'de-DE'`). */
  locale = input<string>();
  /** `Intl.NumberFormat` options for axis and value formatting. */
  valueFormat = input<Intl.NumberFormatOptions>();
  /** Whether the data-table fallback starts visible. */
  showTableInitially = input(false, { transform: booleanAttribute });

  private readonly tableOverride = signal<boolean | null>(null);
  protected readonly tableVisible = computed(
    () => this.tableOverride() ?? this.showTableInitially(),
  );

  protected readonly hasData = computed(
    () =>
      this.categories().length > 0 &&
      this.series().some((s) => s.values.some((v) => v != null)),
  );

  protected readonly viewBox = computed(() => `0 0 ${VIEW_WIDTH} ${this.height()}`);

  protected readonly svgAriaLabel = computed(() => `${this.ariaLabel()}. ${this.i18n.tableSuffix}`);

  /** Resolved colour per series — explicit override or contrast-checked palette token. */
  private readonly seriesColors = computed(() =>
    this.series().map(
      (s, i) => s.color ?? `var(--color-chart-series-${(i % AF_CHART_PALETTE_SIZE) + 1})`,
    ),
  );

  /** Whether the legend should render — hidden for a single series unless opted in. */
  protected readonly legendVisible = computed(
    () => this.showLegend() && (this.series().length > 1 || this.showLegendForSingle()),
  );

  protected readonly legend = computed(() =>
    this.series().map((s, i) => ({ name: s.name, color: this.seriesColors()[i] })),
  );

  /** All geometry needed by the template, derived in a single pass. */
  protected readonly plot = computed<Plot>(() => {
    const categories = this.categories();
    const series = this.series();
    const colors = this.seriesColors();
    const height = this.height();
    const horizontal = this.orientation() === 'horizontal';
    const stacked = this.layout() === 'stacked';
    const histogram = this.histogram();

    // Resolve the plot box; horizontal needs a wider gutter for category labels.
    const marginLeft = horizontal ? HORIZONTAL_LEFT : MARGIN.left;
    const plotLeft = marginLeft;
    const plotRight = VIEW_WIDTH - MARGIN.right;
    const plotTop = MARGIN.top;
    const plotBottom = height - MARGIN.bottom;
    const plotWidth = plotRight - plotLeft;
    const plotHeight = plotBottom - plotTop;

    const scale = this.valueScale(series, stacked);

    // Value-axis pixel scale runs along x (horizontal) or y (vertical, inverted).
    const valueScale = horizontal
      ? scaleLinear(scale.min, scale.max, plotLeft, plotRight)
      : scaleLinear(scale.min, scale.max, plotBottom, plotTop);
    const zeroPx = roundTo(valueScale(0), 2);

    const n = categories.length;
    const bandSpan = (horizontal ? plotHeight : plotWidth) / Math.max(n, 1);
    const bandStart = horizontal ? plotTop : plotLeft;
    const padding = histogram ? 0 : bandSpan * BAND_PADDING;
    const innerSpan = bandSpan - padding;

    const seriesGeom = this.buildSeries(
      series,
      categories,
      colors,
      { stacked, horizontal, valueScale, zeroPx, bandStart, bandSpan, padding, innerSpan },
    );

    const valueTicks = this.buildValueTicks(scale.ticks, {
      horizontal,
      valueScale,
      plotLeft,
      plotRight,
      plotTop,
      plotBottom,
    });

    const categoryLabels = this.buildCategoryLabels(categories, {
      horizontal,
      bandStart,
      bandSpan,
      plotBottom,
      marginLeft,
    });

    const axisLine: AxisLine = horizontal
      ? { x1: zeroPx, y1: roundTo(plotTop, 2), x2: zeroPx, y2: roundTo(plotBottom, 2) }
      : { x1: roundTo(plotLeft, 2), y1: zeroPx, x2: roundTo(plotRight, 2), y2: zeroPx };

    return {
      series: seriesGeom,
      valueTicks,
      categoryLabels,
      axisLine,
      valueLabelAnchor: horizontal ? 'middle' : 'end',
      categoryLabelAnchor: horizontal ? 'end' : 'middle',
    };
  });

  protected readonly tableModel = computed<AfChartTableModel>(() => {
    const categories = this.categories();
    const series = this.series();
    const single = series.length === 1;
    const headers = single
      ? [this.i18n.categoryHeader, this.i18n.valueHeader]
      : [this.i18n.categoryHeader, ...series.map((s) => s.name)];
    return {
      caption: this.ariaLabel(),
      headers,
      rows: categories.map((category, i) => [
        category,
        ...series.map((s) => {
          const v = s.values[i];
          return v == null ? '—' : this.format(v);
        }),
      ]),
    };
  });

  protected toggleTable(): void {
    this.tableOverride.set(!this.tableVisible());
  }

  /**
   * Compute the value-axis domain and ticks. The domain always includes 0; the
   * max defaults to the data max (or the largest stack total in stacked mode).
   */
  private valueScale(series: AfChartSeries[], stacked: boolean) {
    const categoryCount = this.categories().length;
    const allValues = series.flatMap((s) => s.values.filter((v): v is number => v != null));
    const dataMin = allValues.length ? Math.min(...allValues) : 0;
    const dataMax = allValues.length ? Math.max(...allValues) : 1;

    // Stacked bars accumulate positive and negative values into separate stacks,
    // so the axis must reach the largest positive stack *and* the smallest
    // negative stack — not just the largest/smallest single value.
    let maxStackTotal = dataMax;
    let minStackTotal = dataMin;
    if (stacked) {
      maxStackTotal = 0;
      minStackTotal = 0;
      for (let i = 0; i < categoryCount; i++) {
        let pos = 0;
        let neg = 0;
        for (const s of series) {
          const v = s.values[i];
          if (v == null) continue;
          if (v > 0) pos += v;
          else neg += v;
        }
        if (pos > maxStackTotal) maxStackTotal = pos;
        if (neg < minStackTotal) minStackTotal = neg;
      }
    }

    // The value axis always includes the zero baseline so bars grow from an
    // on-canvas origin — even when every value (or stack total) is negative.
    const rawMin = Math.min(0, stacked ? minStackTotal : dataMin);
    const rawMax = this.valueMax() ?? Math.max(0, stacked ? maxStackTotal : dataMax);
    return niceScale(rawMin, rawMax, 5);
  }

  /** Build the per-series bar geometry for every layout/orientation combination. */
  private buildSeries(
    series: AfChartSeries[],
    categories: string[],
    colors: string[],
    ctx: {
      stacked: boolean;
      horizontal: boolean;
      valueScale: (value: number) => number;
      zeroPx: number;
      bandStart: number;
      bandSpan: number;
      padding: number;
      innerSpan: number;
    },
  ): SeriesGeom[] {
    const { stacked, horizontal, valueScale, zeroPx, bandStart, bandSpan, padding, innerSpan } = ctx;
    const seriesCount = series.length;
    // Grouped sub-bars split the inner band evenly and touch each other.
    const subWidth = stacked ? innerSpan : innerSpan / Math.max(seriesCount, 1);
    // Running positive/negative stack offsets per category (value units).
    const posOffset = new Array(categories.length).fill(0);
    const negOffset = new Array(categories.length).fill(0);

    return series.map((s, si) => {
      const bars: PlotBar[] = [];
      categories.forEach((category, ci) => {
        const value = s.values[ci];
        if (value == null) return;

        const bandOrigin = bandStart + ci * bandSpan + padding / 2;
        let startPx: number;
        let endPx: number;
        let cross: number;

        if (stacked) {
          const base = value >= 0 ? posOffset[ci] : negOffset[ci];
          const next = base + value;
          startPx = roundTo(valueScale(base), 2);
          endPx = roundTo(valueScale(next), 2);
          if (value >= 0) posOffset[ci] = next;
          else negOffset[ci] = next;
          cross = bandOrigin;
        } else {
          startPx = zeroPx;
          endPx = roundTo(valueScale(value), 2);
          cross = bandOrigin + si * subWidth;
        }

        bars.push(
          this.makeBar(horizontal, startPx, endPx, cross, subWidth, {
            series: s.name,
            category,
            value,
          }),
        );
      });
      return { name: s.name, color: colors[si], bars };
    });
  }

  /** Assemble one bar rect from value-axis endpoints and the cross-axis band slot. */
  private makeBar(
    horizontal: boolean,
    startPx: number,
    endPx: number,
    cross: number,
    thickness: number,
    meta: { series: string; category: string; value: number },
  ): PlotBar {
    const title = `${meta.series} — ${meta.category}: ${this.format(meta.value)}`;
    const t = roundTo(Math.max(0, thickness), 2);
    const c = roundTo(cross, 2);
    const extent = roundTo(Math.max(0, Math.abs(endPx - startPx)), 2);
    if (horizontal) {
      const x = roundTo(Math.min(startPx, endPx), 2);
      return { x, y: c, width: extent, height: t, title };
    }
    const y = roundTo(Math.min(startPx, endPx), 2);
    return { x: c, y, width: t, height: extent, title };
  }

  /** Build value-axis grid lines + tick labels for the active orientation. */
  private buildValueTicks(
    ticks: number[],
    ctx: {
      horizontal: boolean;
      valueScale: (value: number) => number;
      plotLeft: number;
      plotRight: number;
      plotTop: number;
      plotBottom: number;
    },
  ): ValueTick[] {
    const { horizontal, valueScale, plotLeft, plotRight, plotTop, plotBottom } = ctx;
    return ticks.map((value) => {
      const p = roundTo(valueScale(value), 2);
      const label = this.format(value);
      if (horizontal) {
        return {
          value,
          label,
          x1: p,
          y1: roundTo(plotTop, 2),
          x2: p,
          y2: roundTo(plotBottom, 2),
          labelX: p,
          labelY: roundTo(plotBottom + 18, 2),
        };
      }
      return {
        value,
        label,
        x1: roundTo(plotLeft, 2),
        y1: p,
        x2: roundTo(plotRight, 2),
        y2: p,
        labelX: roundTo(plotLeft - 6, 2),
        labelY: p,
      };
    });
  }

  /** Build category-axis labels centred on each band, anchored per orientation. */
  private buildCategoryLabels(
    categories: string[],
    ctx: {
      horizontal: boolean;
      bandStart: number;
      bandSpan: number;
      plotBottom: number;
      marginLeft: number;
    },
  ): CategoryLabel[] {
    const { horizontal, bandStart, bandSpan, plotBottom, marginLeft } = ctx;
    return categories.map((label, i) => {
      const center = bandStart + i * bandSpan + bandSpan / 2;
      if (horizontal) {
        return { label, x: roundTo(marginLeft - 8, 2), y: roundTo(center, 2) };
      }
      return { label, x: roundTo(center, 2), y: roundTo(plotBottom + 18, 2) };
    });
  }

  private format(value: number): string {
    return formatNumber(value, this.locale(), this.valueFormat());
  }
}

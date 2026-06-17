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
import { AF_CHART_PALETTE_SIZE, AfChartSeries, AfChartTableModel } from '../chart/chart.types';
import {
  ChartPoint,
  buildAreaPath,
  buildLinePath,
  formatNumber,
  niceScale,
  roundTo,
  scaleLinear,
} from '../../utils/chart-geometry';

/** Internal per-point geometry carrying the source value and labels for titles/dots. */
interface PlotPoint extends ChartPoint {
  value: number;
  category: string;
  series: string;
}

/** Resolved geometry for a single series. */
interface SeriesGeom {
  name: string;
  color: string;
  lineSegments: string[];
  areaSegments: string[];
  dots: PlotPoint[];
}

let nextLineChartUid = 0;

const VIEW_WIDTH = 640;
const MARGIN = { top: 12, right: 16, bottom: 28, left: 48 };
const MAX_X_LABELS = 12;

/**
 * Accessible line / area chart for time-series and trend data.
 *
 * Renders one or more {@link AfChartSeries} over a shared category axis as an
 * SVG. Geometry is computed with the SSR-safe `chart-geometry` helpers — no DOM,
 * `window`, or `Date` access — so it renders identically on the server.
 *
 * @example Single trend line
 * <af-line-chart
 *   ariaLabel="Revenue, last 30 days"
 *   [categories]="days"
 *   [series]="[{ name: 'Revenue', values: revenue }]" />
 *
 * @example Multi-series area chart
 * <af-line-chart
 *   ariaLabel="AI cost by origin"
 *   [categories]="weeks"
 *   [series]="[
 *     { name: 'Analyzer', values: analyzer },
 *     { name: 'Resolver', values: resolver },
 *   ]"
 *   [area]="true" />
 *
 * @accessibility
 * - The SVG carries `role="img"` and an `aria-label` describing the chart, with
 *   a pointer to the always-present data-table fallback.
 * - A visually-hidden {@link AfChartDataTableComponent} mirrors every value so
 *   information is never conveyed by colour alone (WCAG 1.4.1); a toggle reveals it.
 * - Each series is labelled in the legend, so colour is never the sole carrier.
 * - Series colours come from the contrast-checked `--color-chart-series-*` tokens.
 * - All user-facing strings are configurable via {@link AF_CHART_I18N}.
 */
@Component({
  selector: 'af-line-chart',
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
            @for (tick of plot().yTicks; track tick.value) {
              <line
                class="ct-chart__grid-line"
                [attr.x1]="margin.left"
                [attr.y1]="tick.y"
                [attr.x2]="viewWidth - margin.right"
                [attr.y2]="tick.y" />
              <text
                class="ct-chart__tick-label"
                [attr.x]="margin.left - 6"
                [attr.y]="tick.y"
                text-anchor="end"
                dominant-baseline="middle">
                {{ tick.label }}
              </text>
            }

            <line
              class="ct-chart__axis-line"
              [attr.x1]="margin.left"
              [attr.y1]="plot().baseY"
              [attr.x2]="viewWidth - margin.right"
              [attr.y2]="plot().baseY" />

            @for (label of plot().xLabels; track $index) {
              <text
                class="ct-chart__tick-label"
                [attr.x]="label.x"
                [attr.y]="plot().baseY + 18"
                text-anchor="middle">
                {{ label.label }}
              </text>
            }

            @for (s of plot().series; track s.name) {
              <g [style.color]="s.color">
                @if (area()) {
                  @for (seg of s.areaSegments; track $index) {
                    <path class="ct-chart__area" [attr.d]="seg" />
                  }
                }
                @for (seg of s.lineSegments; track $index) {
                  <path class="ct-chart__line" [attr.d]="seg" />
                }
                @if (showDots()) {
                  @for (dot of s.dots; track $index) {
                    <circle class="ct-chart__dot" [attr.cx]="dot.x" [attr.cy]="dot.y" r="3">
                      <title>{{ dot.series }} — {{ dot.category }}: {{ formatValue(dot.value) }}</title>
                    </circle>
                  }
                }
              </g>
            }
          </svg>

          @if (showLegend()) {
            <ul class="ct-chart__legend">
              @for (item of legend(); track item.name) {
                <li class="ct-chart__legend-item" [style.color]="item.color">
                  <span
                    class="ct-chart__legend-marker ct-chart__legend-marker--line"
                    aria-hidden="true"></span>
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
export class AfLineChartComponent {
  protected readonly i18n = inject(AF_CHART_I18N);
  protected readonly margin = MARGIN;
  protected readonly viewWidth = VIEW_WIDTH;
  protected readonly tableId = `af-line-chart-${nextLineChartUid++}`;

  /** Accessible chart label (required by the WAI-ARIA `img` role). */
  ariaLabel = input.required<string>();
  /** X-axis category labels (e.g. dates). Series values align 1:1 with these. */
  categories = input.required<string[]>();
  /** One or more data series sharing the category axis. */
  series = input.required<AfChartSeries[]>();
  /** Fill the area beneath each line. */
  area = input(false, { transform: booleanAttribute });
  /** Render point markers on each value. */
  showDots = input(true, { transform: booleanAttribute });
  /** Show the series legend. */
  showLegend = input(true, { transform: booleanAttribute });
  /** Chart height in viewBox units (width is fluid). */
  height = input(280);
  /** Force the y-axis minimum; defaults to a nice value derived from the data. */
  yMin = input<number | null>(null);
  /** Force the y-axis maximum; defaults to a nice value derived from the data. */
  yMax = input<number | null>(null);
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

  protected readonly legend = computed(() =>
    this.series().map((s, i) => ({ name: s.name, color: this.seriesColors()[i] })),
  );

  /** All geometry needed by the template, derived in a single pass. */
  protected readonly plot = computed(() => {
    const categories = this.categories();
    const series = this.series();
    const height = this.height();
    const colors = this.seriesColors();

    const plotLeft = MARGIN.left;
    const plotRight = VIEW_WIDTH - MARGIN.right;
    const plotTop = MARGIN.top;
    const baseY = height - MARGIN.bottom;
    const plotWidth = plotRight - plotLeft;

    const allValues = series.flatMap((s) => s.values.filter((v): v is number => v != null));
    const dataMin = allValues.length ? Math.min(...allValues) : 0;
    const dataMax = allValues.length ? Math.max(...allValues) : 1;
    const rawMin = this.yMin() ?? (this.area() ? Math.min(0, dataMin) : dataMin);
    const rawMax = this.yMax() ?? dataMax;
    const scale = niceScale(rawMin, rawMax, 5);

    const yScale = scaleLinear(scale.min, scale.max, baseY, plotTop);
    const xAt = (i: number) =>
      categories.length <= 1
        ? plotLeft + plotWidth / 2
        : plotLeft + (i / (categories.length - 1)) * plotWidth;

    const yTicks = scale.ticks.map((value) => ({
      value,
      y: roundTo(yScale(value), 2),
      label: this.format(value),
    }));

    const labelStep = Math.max(1, Math.ceil(categories.length / MAX_X_LABELS));
    const xLabels = categories
      .map((label, i) => ({ label, x: roundTo(xAt(i), 2), i }))
      .filter(({ i }) => i % labelStep === 0 || i === categories.length - 1);

    const seriesGeom: SeriesGeom[] = series.map((s, si) => {
      const segments: PlotPoint[][] = [];
      let current: PlotPoint[] = [];
      s.values.forEach((v, i) => {
        if (v == null) {
          if (current.length) segments.push(current);
          current = [];
          return;
        }
        current.push({
          x: roundTo(xAt(i), 2),
          y: roundTo(yScale(v), 2),
          value: v,
          category: categories[i] ?? String(i),
          series: s.name,
        });
      });
      if (current.length) segments.push(current);

      return {
        name: s.name,
        color: colors[si],
        lineSegments: segments.map(buildLinePath),
        areaSegments: segments.map((seg) => buildAreaPath(seg, baseY)),
        dots: segments.flat(),
      };
    });

    return { baseY: roundTo(baseY, 2), yTicks, xLabels, series: seriesGeom };
  });

  protected readonly tableModel = computed<AfChartTableModel>(() => {
    const categories = this.categories();
    const series = this.series();
    return {
      caption: this.ariaLabel(),
      headers: [this.i18n.categoryHeader, ...series.map((s) => s.name)],
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

  protected formatValue(value: number): string {
    return this.format(value);
  }

  private format(value: number): string {
    return formatNumber(value, this.locale(), this.valueFormat());
  }
}

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
import { AF_CHART_PALETTE_SIZE, AfChartDatum, AfChartTableModel } from '../chart/chart.types';
import { clamp, donutSlicePath, formatNumber } from '../../utils/chart-geometry';

/** Resolved geometry and labels for a single rendered ring slice. */
interface DonutSlice {
  label: string;
  color: string;
  /** SVG path `d` for the slice arc. */
  path: string;
  /** Formatted magnitude (e.g. `'40'`). */
  value: string;
  /** Formatted share including the `%` sign (e.g. `'40%'`). */
  percent: string;
}

/** A legend row — one per datum, including zero-value data. */
interface DonutLegendItem {
  label: string;
  color: string;
  /** Formatted share including the `%` sign (e.g. `'40%'`). */
  percent: string;
}

let nextDonutChartUid = 0;

const VIEW_WIDTH = 640;
const MARGIN = 16;

/**
 * Accessible donut / pie chart for part-to-whole data.
 *
 * Renders a set of {@link AfChartDatum} slices as an SVG ring (or full pie when
 * `innerRadiusRatio` is 0). Arc geometry is computed with the SSR-safe
 * `chart-geometry` helpers — no DOM, `window`, `Date` or `Math.random` access —
 * so it renders identically on the server.
 *
 * @example Donut with a centre total
 * <af-donut-chart
 *   ariaLabel="Contract mix"
 *   [data]="[
 *     { label: 'Enterprise', value: 60 },
 *     { label: 'Team', value: 40 },
 *   ]"
 *   centerLabel="Total" />
 *
 * @example Full pie
 * <af-donut-chart
 *   ariaLabel="AI cost by origin"
 *   [data]="costs"
 *   [innerRadiusRatio]="0" />
 *
 * @accessibility
 * - The SVG carries `role="img"` and an `aria-label` describing the chart, with
 *   a pointer to the always-present data-table fallback.
 * - A visually-hidden {@link AfChartDataTableComponent} mirrors every slice's
 *   exact value and percentage, so information is never conveyed by colour alone
 *   (WCAG 1.4.1); a toggle reveals it.
 * - The legend lists every slice label (including zero-value data), so colour is
 *   never the sole carrier, and each slice exposes a native `<title>` tooltip.
 * - Slice colours come from the contrast-checked `--color-chart-series-*` tokens.
 * - All user-facing strings are configurable via {@link AF_CHART_I18N}.
 */
@Component({
  selector: 'af-donut-chart',
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
            @for (slice of plot().slices; track slice.label) {
              <path class="ct-chart__slice" [attr.d]="slice.path" [style.color]="slice.color">
                <title>{{ slice.label }}: {{ slice.value }} ({{ slice.percent }})</title>
              </path>
            }

            @if (plot().showCenter) {
              <text
                class="ct-chart__donut-value"
                [attr.x]="plot().cx"
                [attr.y]="plot().cy"
                text-anchor="middle"
                dominant-baseline="middle">
                {{ centerValueText() }}
              </text>
              @if (centerLabel()) {
                <text
                  class="ct-chart__donut-label"
                  [attr.x]="plot().cx"
                  [attr.y]="plot().labelY"
                  text-anchor="middle"
                  dominant-baseline="middle">
                  {{ centerLabel() }}
                </text>
              }
            }
          </svg>

          @if (showLegend()) {
            <ul class="ct-chart__legend">
              @for (item of legend(); track item.label) {
                <li class="ct-chart__legend-item">
                  <span
                    class="ct-chart__legend-marker"
                    [style.color]="item.color"
                    aria-hidden="true"></span>
                  <span>{{ item.label }}</span>
                  @if (showPercentInLegend()) {
                    <span>{{ item.percent }}</span>
                  }
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
export class AfDonutChartComponent {
  protected readonly i18n = inject(AF_CHART_I18N);
  protected readonly tableId = `af-donut-chart-${nextDonutChartUid++}`;

  /** Accessible chart label (required by the WAI-ARIA `img` role). */
  ariaLabel = input.required<string>();
  /** Slices of the ring. Negative values clamp to 0; zero-value slices are
   * omitted from the ring but still listed in the legend and data table. */
  data = input.required<AfChartDatum[]>();
  /** Hole size as a fraction of the radius: `0` → full pie, `~0.6` → donut.
   * Clamped to `[0, 0.9]`. */
  innerRadiusRatio = input(0.6);
  /** Small caption rendered inside the donut hole (e.g. `'Total'`). */
  centerLabel = input('');
  /** Big text inside the hole; defaults to the formatted sum of values. */
  centerValue = input('');
  /** Show the slice legend. */
  showLegend = input(true, { transform: booleanAttribute });
  /** Show each slice's percentage share next to its legend label. */
  showPercentInLegend = input(true, { transform: booleanAttribute });
  /** Chart height in viewBox units (width is fluid). */
  height = input(260);
  /** BCP-47 locale for number formatting (e.g. `'de-DE'`). */
  locale = input<string>();
  /** `Intl.NumberFormat` options for value formatting. */
  valueFormat = input<Intl.NumberFormatOptions>();
  /** Whether the data-table fallback starts visible. */
  showTableInitially = input(false, { transform: booleanAttribute });

  private readonly tableOverride = signal<boolean | null>(null);
  protected readonly tableVisible = computed(
    () => this.tableOverride() ?? this.showTableInitially(),
  );

  /** Clamped magnitudes aligned 1:1 with `data()` (negatives → 0). */
  private readonly values = computed(() => this.data().map((d) => Math.max(0, d.value)));

  private readonly total = computed(() => this.values().reduce((sum, v) => sum + v, 0));

  protected readonly hasData = computed(() => this.total() > 0);

  protected readonly viewBox = computed(() => `0 0 ${VIEW_WIDTH} ${this.height()}`);

  protected readonly svgAriaLabel = computed(() => `${this.ariaLabel()}. ${this.i18n.tableSuffix}`);

  /** Resolved colour per datum — explicit override or contrast-checked palette
   * token — keyed by original index so slices and legend never diverge. */
  private readonly colors = computed(() =>
    this.data().map(
      (d, i) => d.color ?? `var(--color-chart-series-${(i % AF_CHART_PALETTE_SIZE) + 1})`,
    ),
  );

  /** Formatted shares aligned 1:1 with `data()` (e.g. `'40%'`). */
  private readonly percents = computed(() => {
    const total = this.total() || 1;
    return this.values().map((v) => this.formatPercent((v / total) * 100));
  });

  /** Centre value text: explicit override or the formatted total. */
  protected readonly centerValueText = computed(
    () => this.centerValue() || this.format(this.total()),
  );

  protected readonly legend = computed<DonutLegendItem[]>(() =>
    this.data().map((d, i) => ({
      label: d.label,
      color: this.colors()[i],
      percent: this.percents()[i],
    })),
  );

  /** All ring geometry derived in a single pass; zero-value slices are skipped. */
  protected readonly plot = computed(() => {
    const data = this.data();
    const values = this.values();
    const colors = this.colors();
    const percents = this.percents();
    const total = this.total() || 1;
    const height = this.height();

    const cx = VIEW_WIDTH / 2;
    const cy = height / 2;
    const outerRadius = Math.min(VIEW_WIDTH, height) / 2 - MARGIN;
    const innerRadius = outerRadius * clamp(this.innerRadiusRatio(), 0, 0.9);

    const slices: DonutSlice[] = [];
    let startAngle = 0;
    data.forEach((d, i) => {
      const value = values[i];
      const sweep = (360 * value) / total;
      if (value > 0) {
        slices.push({
          label: d.label,
          color: colors[i],
          path: donutSlicePath(cx, cy, outerRadius, innerRadius, startAngle, startAngle + sweep),
          value: this.format(value),
          percent: percents[i],
        });
      }
      startAngle += sweep;
    });

    return {
      slices,
      cx,
      cy,
      labelY: cy + 22,
      showCenter: innerRadius > 0,
    };
  });

  protected readonly tableModel = computed<AfChartTableModel>(() => {
    const data = this.data();
    const values = this.values();
    const percents = this.percents();
    return {
      caption: this.ariaLabel(),
      headers: [this.i18n.categoryHeader, this.i18n.valueHeader, this.i18n.percentHeader],
      rows: data.map((d, i) => [d.label, this.format(values[i]), percents[i]]),
    };
  });

  protected toggleTable(): void {
    this.tableOverride.set(!this.tableVisible());
  }

  /** Format a percentage to at most one fraction digit, suffixed with `%`. */
  private formatPercent(value: number): string {
    return `${formatNumber(value, this.locale(), { maximumFractionDigits: 1 })}%`;
  }

  private format(value: number): string {
    return formatNumber(value, this.locale(), this.valueFormat());
  }
}

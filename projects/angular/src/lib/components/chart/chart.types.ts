/**
 * Shared data contracts for the `af-*-chart` family.
 *
 * The shapes mirror the dashboard stats DTO (`{ value, delta, series, breakdown }`)
 * so server aggregates map onto the charts with no client-side reshaping:
 * a time/category series feeds {@link AfChartSeries}, a breakdown feeds
 * {@link AfChartDatum}.
 */

/** Maximum number of distinct palette colours before they repeat. */
export const AF_CHART_PALETTE_SIZE = 8;

/**
 * A named data series sharing the chart's category axis. Used by the line,
 * area and bar charts.
 */
export interface AfChartSeries {
  /** Legend label and accessible series name. */
  name: string;
  /**
   * Y-values aligned 1:1 with the chart's `categories` input. A `null` entry
   * renders as a gap (missing data) rather than a zero.
   */
  values: (number | null)[];
  /** Optional explicit CSS colour; defaults to the palette slot for the series index. */
  color?: string;
}

/**
 * A single labelled magnitude used by part-to-whole charts (donut/pie) and as
 * the simplest single-series shape for bars.
 */
export interface AfChartDatum {
  /** Slice/bar label — shown in the legend and the accessible data table. */
  label: string;
  /** Magnitude; negative values are clamped to 0 for part-to-whole charts. */
  value: number;
  /** Optional explicit CSS colour; defaults to the palette slot for the datum index. */
  color?: string;
}

/** Semantic colour buckets shared by the gauge and threshold-driven visuals. */
export type AfChartStatus = 'default' | 'success' | 'warning' | 'danger';

/**
 * A gauge threshold band: once the gauge value reaches `from` (in value units),
 * the arc adopts `status`. The highest matching band wins.
 */
export interface AfGaugeThreshold {
  /** Inclusive lower bound in the gauge's own value units. */
  from: number;
  /** Colour bucket applied at or above `from`. */
  status: AfChartStatus;
}

/** How a bar chart lays out multiple series. */
export type AfBarLayout = 'grouped' | 'stacked';

/** Row model for the accessible data-table fallback rendered by every chart. */
export interface AfChartTableModel {
  /** Caption summarising the chart for assistive technology. */
  caption: string;
  /** Column headers; the first is the category/label column. */
  headers: string[];
  /** Body rows, each aligned 1:1 with `headers`. */
  rows: (string | number)[][];
}

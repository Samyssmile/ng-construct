import { InjectionToken } from '@angular/core';

/** Translatable strings shared by all chart components. */
export interface AfChartI18n {
  /** Accessible label for the button that reveals the data-table fallback. */
  showTable: string;
  /** Accessible label for the button that hides the data-table fallback. */
  hideTable: string;
  /** Visible/SR text shown when a chart has no data. */
  noData: string;
  /** Header for the value column in the data-table fallback. */
  valueHeader: string;
  /** Header for the category column in the data-table fallback. */
  categoryHeader: string;
  /** Header for the series column in the (long-format) data-table fallback. */
  seriesHeader: string;
  /** Header for the percentage column in the donut data-table fallback. */
  percentHeader: string;
  /** Suffix appended to a chart's `aria-label` describing the table fallback. */
  tableSuffix: string;
  /**
   * Template for the sparkline's `aria-label` summary. Supports the placeholders
   * `{label}`, `{count}`, `{min}`, `{max}` and `{last}`. Optional — a built-in
   * English default is used when omitted.
   */
  sparklineSummary?: string;
}

/**
 * Injection token to override the chart components' screen-reader and control
 * strings. Libraries ship English defaults; consumers translate via DI.
 *
 * @example
 * providers: [{
 *   provide: AF_CHART_I18N,
 *   useValue: {
 *     showTable: 'Daten als Tabelle anzeigen',
 *     hideTable: 'Tabelle ausblenden',
 *     noData: 'Keine Daten',
 *     valueHeader: 'Wert',
 *     categoryHeader: 'Kategorie',
 *     seriesHeader: 'Datenreihe',
 *     percentHeader: 'Anteil',
 *     tableSuffix: 'Datentabelle unterhalb des Diagramms verfügbar.',
 *   },
 * }]
 */
export const AF_CHART_I18N = new InjectionToken<AfChartI18n>('AfChartI18n', {
  factory: () => ({
    showTable: 'Show data table',
    hideTable: 'Hide data table',
    noData: 'No data available',
    valueHeader: 'Value',
    categoryHeader: 'Category',
    seriesHeader: 'Series',
    percentHeader: 'Share',
    tableSuffix: 'A data table is available below the chart.',
    sparklineSummary: '{label}: {count} points, min {min}, max {max}, latest {last}.',
  }),
});

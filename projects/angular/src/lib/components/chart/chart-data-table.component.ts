import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AfChartTableModel } from './chart.types';

/**
 * Accessible data-table equivalent of a chart, rendered as a real semantic
 * `<table>`. Every `af-*-chart` embeds one inside `.ct-chart__table-wrap`, which
 * keeps it visually hidden but available to assistive technology by default and
 * reveals it when the consumer toggles `.ct-chart--show-table`.
 *
 * This guarantees the chart's information is never conveyed by colour or shape
 * alone (WCAG 1.4.1) and gives screen-reader and keyboard users the exact values.
 *
 * @docs-private — consumers use it indirectly via the chart components.
 */
@Component({
  selector: 'af-chart-data-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @if (model(); as m) {
      <table class="ct-chart__table">
        <caption>{{ m.caption }}</caption>
        <thead>
          <tr>
            @for (header of m.headers; track $index) {
              <th scope="col">{{ header }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of m.rows; track $index) {
            <tr>
              @for (cell of row; track $index) {
                @if ($first) {
                  <th scope="row">{{ cell }}</th>
                } @else {
                  <td>{{ cell }}</td>
                }
              }
            </tr>
          }
        </tbody>
      </table>
    }
  `,
})
export class AfChartDataTableComponent {
  /** Table model (caption, headers, rows) describing the chart's data. */
  model = input.required<AfChartTableModel>();
}

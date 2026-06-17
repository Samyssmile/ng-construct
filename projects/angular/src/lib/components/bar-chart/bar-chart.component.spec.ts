import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AfBarChartComponent } from './bar-chart.component';
import { AfBarChartHarness } from './bar-chart.harness';
import { AF_CHART_I18N } from '../chart/chart.i18n';
import { AfBarLayout, AfChartSeries } from '../chart/chart.types';
import { checkA11y } from '../../testing/axe-helper';

@Component({
  imports: [AfBarChartComponent],
  template: `
    <af-bar-chart
      [ariaLabel]="ariaLabel()"
      [categories]="categories()"
      [series]="series()"
      [layout]="layout()"
      [orientation]="orientation()"
      [histogram]="histogram()"
      [showLegend]="showLegend()"
      [showLegendForSingle]="showLegendForSingle()" />
  `,
})
class HostComponent {
  ariaLabel = signal('Tickets by status');
  categories = signal(['Open', 'Doing', 'Review', 'Done']);
  series = signal<AfChartSeries[]>([{ name: 'Tickets', values: [12, 8, 5, 20] }]);
  layout = signal<AfBarLayout>('grouped');
  orientation = signal<'vertical' | 'horizontal'>('vertical');
  histogram = signal(false);
  showLegend = signal(true);
  showLegendForSingle = signal(false);
}

function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const harness = new AfBarChartHarness(fixture.nativeElement);
  return { fixture, host: fixture.componentInstance, harness };
}

const TWO_SERIES: AfChartSeries[] = [
  { name: 'Analyzer', values: [10, 20, 30, 40] },
  { name: 'Resolver', values: [40, 30, 20, 10] },
];

describe('AfBarChartComponent', () => {
  describe('rendering', () => {
    it('renders an SVG with role="img" and an aria-label', () => {
      const { harness } = setup();
      expect(harness.getSvg()).not.toBeNull();
      expect(harness.getSvg()?.getAttribute('role')).toBe('img');
      expect(harness.getAriaLabel()).toContain('Tickets by status');
    });

    it('renders one bar per category for a single series', () => {
      const { harness } = setup();
      expect(harness.getBarCount()).toBe(4);
    });

    it('renders grouped sub-bars side by side for multiple series', () => {
      const { fixture, host, harness } = setup();
      host.series.set(TWO_SERIES);
      fixture.detectChanges();
      // 2 series × 4 categories = 8 bars.
      expect(harness.getBarCount()).toBe(8);
    });

    it('skips bars for null values', () => {
      const { fixture, host, harness } = setup();
      host.series.set([{ name: 'Tickets', values: [12, null, 5, null] }]);
      fixture.detectChanges();
      expect(harness.getBarCount()).toBe(2);
    });

    it('grows positive bars up from the zero line and negatives down', () => {
      const { fixture, host, harness } = setup();
      host.series.set([{ name: 'Net', values: [10, -10] }]);
      fixture.detectChanges();
      const [up, down] = harness.getBars();
      const upY = Number(up.getAttribute('y'));
      const downY = Number(down.getAttribute('y'));
      // The negative bar's top edge sits below the positive bar's top edge.
      expect(downY).toBeGreaterThan(upY);
    });

    it('keeps the zero baseline on-canvas when every value is negative', () => {
      const { fixture, host, harness } = setup();
      host.series.set([{ name: 'Net', values: [-5, -10, -3] }]);
      fixture.detectChanges();
      const ticks = harness.getValueTickLabels().map(Number);
      // Zero stays the top of the domain — no positive overshoot, baseline visible.
      expect(ticks).toContain(0);
      expect(Math.max(...ticks)).toBe(0);
      // Every bar stays inside the 280-unit viewBox (no overflow past the top edge).
      for (const bar of harness.getBars()) {
        const y = Number(bar.getAttribute('y'));
        const h = Number(bar.getAttribute('height'));
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y + h).toBeLessThanOrEqual(280);
      }
    });

    it('extends the domain to the full negative stack total when stacked', () => {
      const { fixture, host, harness } = setup();
      host.categories.set(['Q1']);
      host.series.set([
        { name: 'A', values: [-5] },
        { name: 'B', values: [-10] },
      ]);
      host.layout.set('stacked');
      fixture.detectChanges();
      const ticks = harness.getValueTickLabels().map(Number);
      // The stack reaches -15, so the axis minimum must reach it too (was -10 before).
      expect(Math.min(...ticks)).toBeLessThanOrEqual(-15);
      expect(ticks).toContain(0);
      for (const bar of harness.getBars()) {
        const y = Number(bar.getAttribute('y'));
        const h = Number(bar.getAttribute('height'));
        expect(y + h).toBeLessThanOrEqual(280);
      }
    });

    it('renders nice, ascending value-axis tick labels', () => {
      const { harness } = setup();
      const ticks = harness.getValueTickLabels().map(Number);
      expect(ticks.length).toBeGreaterThanOrEqual(2);
      const sorted = [...ticks].sort((a, b) => a - b);
      expect(ticks).toEqual(sorted);
    });

    it('always includes a zero tick on the value axis', () => {
      const { harness } = setup();
      expect(harness.getValueTickLabels()).toContain('0');
    });

    it('renders the category labels', () => {
      const { harness } = setup();
      expect(harness.getCategoryLabels()).toEqual(['Open', 'Doing', 'Review', 'Done']);
    });
  });

  describe('stacked layout', () => {
    it('renders a bar per series per category and stacks them', () => {
      const { fixture, host, harness } = setup();
      host.series.set(TWO_SERIES);
      host.layout.set('stacked');
      fixture.detectChanges();
      expect(harness.getBarCount()).toBe(8);
      // Stacked bars in a category share the same x (column), unlike grouped.
      const bars = harness.getBars();
      const firstCatXs = [bars[0], bars[4]].map((b) => b.getAttribute('x'));
      expect(firstCatXs[0]).toBe(firstCatXs[1]);
    });

    it('scales the domain to the largest stack total', () => {
      const { fixture, host, harness } = setup();
      host.series.set(TWO_SERIES);
      host.layout.set('stacked');
      fixture.detectChanges();
      // Each category totals 50, so the axis max ticks reach at least 50.
      const max = Math.max(...harness.getValueTickLabels().map(Number));
      expect(max).toBeGreaterThanOrEqual(50);
    });
  });

  describe('horizontal orientation', () => {
    it('renders bars growing rightward (width-driven)', () => {
      const { fixture, host, harness } = setup();
      host.orientation.set('horizontal');
      fixture.detectChanges();
      const bars = harness.getBars();
      expect(bars.length).toBe(4);
      // Larger value → wider bar.
      const widths = bars.map((b) => Number(b.getAttribute('width')));
      expect(widths[3]).toBeGreaterThan(widths[2]);
    });

    it('still mirrors the data in the table', () => {
      const { fixture, host, harness } = setup();
      host.orientation.set('horizontal');
      fixture.detectChanges();
      expect(harness.getTableRowCount()).toBe(4);
    });
  });

  describe('histogram', () => {
    it('renders contiguous bars with no inter-bar gap', () => {
      const { fixture, host, harness } = setup();
      host.histogram.set(true);
      host.categories.set(['0–50', '50–100', '100–150', '150–200', '200–250']);
      host.series.set([{ name: 'Counts', values: [3, 7, 5, 9, 4] }]);
      fixture.detectChanges();
      const bars = harness.getBars();
      expect(bars.length).toBe(5);
      // Each bar's right edge meets the next bar's left edge (allowing rounding).
      for (let i = 0; i < bars.length - 1; i++) {
        const right = Number(bars[i].getAttribute('x')) + Number(bars[i].getAttribute('width'));
        const nextLeft = Number(bars[i + 1].getAttribute('x'));
        expect(Math.abs(right - nextLeft)).toBeLessThan(0.5);
      }
    });
  });

  describe('legend', () => {
    it('hides the legend for a single series by default', () => {
      const { harness } = setup();
      expect(harness.getLegendLabels().length).toBe(0);
    });

    it('shows the legend for a single series when opted in', () => {
      const { fixture, host, harness } = setup();
      host.showLegendForSingle.set(true);
      fixture.detectChanges();
      expect(harness.getLegendLabels()).toEqual(['Tickets']);
    });

    it('shows the legend with multiple series', () => {
      const { fixture, host, harness } = setup();
      host.series.set(TWO_SERIES);
      fixture.detectChanges();
      expect(harness.getLegendLabels()).toEqual(['Analyzer', 'Resolver']);
    });

    it('hides the legend when showLegend is false', () => {
      const { fixture, host, harness } = setup();
      host.series.set(TWO_SERIES);
      host.showLegend.set(false);
      fixture.detectChanges();
      expect(harness.getLegendLabels().length).toBe(0);
    });
  });

  describe('empty state', () => {
    it('shows the empty message when there is no data', () => {
      const { fixture, host, harness } = setup();
      host.series.set([{ name: 'Tickets', values: [] }]);
      host.categories.set([]);
      fixture.detectChanges();
      expect(harness.isEmpty()).toBe(true);
      expect(harness.getSvg()).toBeNull();
    });
  });

  describe('accessible data table', () => {
    it('uses Category/Value headers for a single series', () => {
      const { harness } = setup();
      expect(harness.getTable()).not.toBeNull();
      expect(harness.getTableHeaders()).toEqual(['Category', 'Value']);
      expect(harness.getTableRowCount()).toBe(4);
    });

    it('uses series names as headers for multiple series', () => {
      const { fixture, host, harness } = setup();
      host.series.set(TWO_SERIES);
      fixture.detectChanges();
      expect(harness.getTableHeaders()).toEqual(['Category', 'Analyzer', 'Resolver']);
    });

    it('renders an em dash for null values', () => {
      const { fixture, host } = setup();
      host.series.set([{ name: 'Tickets', values: [12, null, 5, 20] }]);
      fixture.detectChanges();
      const cells = Array.from(
        fixture.nativeElement.querySelectorAll('.ct-chart__table tbody td'),
      ).map((td) => (td as HTMLElement).textContent?.trim());
      expect(cells).toContain('—');
    });

    it('toggles table visibility via the toggle button', () => {
      const { fixture, harness } = setup();
      expect(harness.isTableVisible()).toBe(false);
      expect(harness.getToggle()?.getAttribute('aria-expanded')).toBe('false');
      harness.toggleTable();
      fixture.detectChanges();
      expect(harness.isTableVisible()).toBe(true);
      expect(harness.getToggle()?.getAttribute('aria-expanded')).toBe('true');
    });

    it('links the toggle to the table via aria-controls', () => {
      const { harness } = setup();
      const controls = harness.getToggle()?.getAttribute('aria-controls');
      expect(controls).toBeTruthy();
      const wrap = harness.getTable()?.closest('.ct-chart__table-wrap');
      expect(wrap?.id).toBe(controls);
    });
  });

  describe('i18n', () => {
    it('uses overridden strings from AF_CHART_I18N', () => {
      TestBed.configureTestingModule({
        providers: [
          {
            provide: AF_CHART_I18N,
            useValue: {
              showTable: 'Tabelle zeigen',
              hideTable: 'Tabelle verbergen',
              noData: 'Keine Daten',
              valueHeader: 'Wert',
              categoryHeader: 'Kategorie',
              seriesHeader: 'Reihe',
              percentHeader: 'Anteil',
              tableSuffix: 'Tabelle unten.',
            },
          },
        ],
      });
      const { harness } = setup();
      expect(harness.getToggle()?.textContent?.trim()).toBe('Tabelle zeigen');
      expect(harness.getTableHeaders()).toEqual(['Kategorie', 'Wert']);
      expect(harness.getAriaLabel()).toContain('Tabelle unten.');
    });
  });

  describe('accessibility', () => {
    it('has no axe violations with data', async () => {
      const { fixture } = setup();
      await checkA11y(fixture.nativeElement);
    });

    it('has no axe violations in the empty state', async () => {
      const { fixture, host } = setup();
      host.series.set([{ name: 'Tickets', values: [] }]);
      host.categories.set([]);
      fixture.detectChanges();
      await checkA11y(fixture.nativeElement);
    });

    it('has no axe violations with the table revealed', async () => {
      const { fixture, harness } = setup();
      harness.toggleTable();
      fixture.detectChanges();
      await checkA11y(fixture.nativeElement);
    });
  });
});

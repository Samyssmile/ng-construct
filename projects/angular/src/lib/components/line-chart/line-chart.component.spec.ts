import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AfLineChartComponent } from './line-chart.component';
import { AfLineChartHarness } from './line-chart.harness';
import { AF_CHART_I18N } from '../chart/chart.i18n';
import { AfChartSeries } from '../chart/chart.types';
import { checkA11y } from '../../testing/axe-helper';

@Component({
  imports: [AfLineChartComponent],
  template: `
    <af-line-chart
      [ariaLabel]="ariaLabel()"
      [categories]="categories()"
      [tickLabels]="tickLabels()"
      [series]="series()"
      [area]="area()"
      [showDots]="showDots()"
      [showLegend]="showLegend()" />
  `,
})
class HostComponent {
  ariaLabel = signal('Revenue, last 5 days');
  categories = signal(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  tickLabels = signal<string[] | null>(null);
  series = signal<AfChartSeries[]>([{ name: 'Revenue', values: [10, 30, 20, 40, 35] }]);
  area = signal(false);
  showDots = signal(true);
  showLegend = signal(true);
}

function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const harness = new AfLineChartHarness(fixture.nativeElement);
  return { fixture, host: fixture.componentInstance, harness };
}

describe('AfLineChartComponent', () => {
  describe('rendering', () => {
    it('renders an SVG with role="img" and an aria-label', () => {
      const { harness } = setup();
      expect(harness.getSvg()).not.toBeNull();
      expect(harness.getSvg()?.getAttribute('role')).toBe('img');
      expect(harness.getAriaLabel()).toContain('Revenue, last 5 days');
    });

    it('renders one line path per series', () => {
      const { harness } = setup();
      expect(harness.getSeriesCount()).toBe(1);
      expect(harness.getLinePaths()[0]).toMatch(/^M/);
    });

    it('renders multiple series', () => {
      const { fixture, host, harness } = setup();
      host.series.set([
        { name: 'A', values: [1, 2, 3, 4, 5] },
        { name: 'B', values: [5, 4, 3, 2, 1] },
      ]);
      fixture.detectChanges();
      expect(harness.getSeriesCount()).toBe(2);
      expect(harness.getLegendLabels()).toEqual(['A', 'B']);
    });

    it('renders dots only when showDots is true', () => {
      const { fixture, host, harness } = setup();
      expect(harness.getDotCount()).toBe(5);
      host.showDots.set(false);
      fixture.detectChanges();
      expect(harness.getDotCount()).toBe(0);
    });

    it('renders area fills only when area is true', () => {
      const { fixture, host, harness } = setup();
      expect(harness.getAreaCount()).toBe(0);
      host.area.set(true);
      fixture.detectChanges();
      expect(harness.getAreaCount()).toBe(1);
    });

    it('hides the legend when showLegend is false', () => {
      const { fixture, host, harness } = setup();
      expect(harness.getLegendLabels().length).toBe(1);
      host.showLegend.set(false);
      fixture.detectChanges();
      expect(harness.getLegendLabels().length).toBe(0);
    });

    it('renders nice, ascending y-axis tick labels', () => {
      const { harness } = setup();
      const ticks = harness.getYTickLabels().map(Number);
      expect(ticks.length).toBeGreaterThanOrEqual(2);
      const sorted = [...ticks].sort((a, b) => a - b);
      expect(ticks).toEqual(sorted);
    });

    it('includes a zero baseline in area mode', () => {
      const { fixture, host, harness } = setup();
      host.area.set(true);
      fixture.detectChanges();
      expect(harness.getYTickLabels()).toContain('0');
    });

    it('breaks the line into segments around null gaps', () => {
      const { fixture, host, harness } = setup();
      host.series.set([{ name: 'Pages', values: [10, null, 20, null, 30] }]);
      fixture.detectChanges();
      // Three isolated non-null points → three single-point segments.
      expect(harness.getLinePaths().length).toBe(3);
    });
  });

  describe('x-axis labels', () => {
    const xPositions = (el: HTMLElement) =>
      Array.from(el.querySelectorAll('.ct-chart__tick-label[text-anchor="middle"]')).map((t) =>
        Number(t.getAttribute('x')),
      );

    it('labels every category when the labels fit', () => {
      const { harness } = setup();
      expect(harness.getXTickLabels()).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    });

    it('thins long labels so neighbours never overlap and keeps the last one', () => {
      const { fixture, host, harness } = setup();
      const days = Array.from({ length: 31 }, (_, i) => `2026-09-${String(i + 1).padStart(2, '0')}`);
      host.categories.set(days);
      host.series.set([{ name: 'Pages', values: days.map((_, i) => i) }]);
      fixture.detectChanges();

      const labels = harness.getXTickLabels();
      const xs = xPositions(fixture.nativeElement);
      // "2026-09-01" ≈ 10 × 12 × 0.6 = 72 units, plus the 8-unit gap
      for (let i = 1; i < xs.length; i++) {
        expect(xs[i] - xs[i - 1]).toBeGreaterThanOrEqual(80);
      }
      expect(labels[0]).toBe('2026-09-01');
      expect(labels[labels.length - 1]).toBe('2026-09-31');
      expect(labels.length).toBeLessThan(31);
    });

    it('fits more labels when tickLabels are shorter than the categories', () => {
      const { fixture, host, harness } = setup();
      const hours = Array.from({ length: 25 }, (_, i) => `29 Sept 2026, ${String(i % 24).padStart(2, '0')}:00`);
      host.categories.set(hours);
      host.series.set([{ name: 'Pages', values: hours.map(() => 1) }]);
      fixture.detectChanges();
      const withCategories = harness.getXTickLabels().length;

      host.tickLabels.set(hours.map((h) => h.slice(-5)));
      fixture.detectChanges();
      const withTicks = harness.getXTickLabels();

      expect(withTicks.length).toBeGreaterThan(withCategories);
      expect(withTicks[0]).toBe('00:00');
    });

    it('shows tickLabels on the axis but full categories in the data table', () => {
      const { fixture, host, harness } = setup();
      host.tickLabels.set(['M', 'T', 'W', 'T', 'F']);
      fixture.detectChanges();

      expect(harness.getXTickLabels()).toEqual(['M', 'T', 'W', 'T', 'F']);
      const firstCell = harness.getTable()!.querySelector('tbody tr th, tbody tr td');
      expect(firstCell!.textContent!.trim()).toBe('Mon');
    });

    it('falls back to the category where a tick label is missing', () => {
      const { fixture, host, harness } = setup();
      host.tickLabels.set(['M', 'T']);
      fixture.detectChanges();

      expect(harness.getXTickLabels()).toEqual(['M', 'T', 'Wed', 'Thu', 'Fri']);
    });
  });

  describe('empty state', () => {
    it('shows the empty message when there is no data', () => {
      const { fixture, host, harness } = setup();
      host.series.set([{ name: 'Revenue', values: [] }]);
      host.categories.set([]);
      fixture.detectChanges();
      expect(harness.isEmpty()).toBe(true);
      expect(harness.getSvg()).toBeNull();
    });
  });

  describe('accessible data table', () => {
    it('always renders a data-table mirror of the series', () => {
      const { harness } = setup();
      expect(harness.getTable()).not.toBeNull();
      expect(harness.getTableHeaders()).toEqual(['Category', 'Revenue']);
      expect(harness.getTableRowCount()).toBe(5);
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
      expect(harness.getTableHeaders()[0]).toBe('Kategorie');
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
      host.series.set([{ name: 'Revenue', values: [] }]);
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

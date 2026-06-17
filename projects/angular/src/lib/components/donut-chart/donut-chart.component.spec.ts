import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AfDonutChartComponent } from './donut-chart.component';
import { AfDonutChartHarness } from './donut-chart.harness';
import { AF_CHART_I18N } from '../chart/chart.i18n';
import { AfChartDatum } from '../chart/chart.types';
import { checkA11y } from '../../testing/axe-helper';

@Component({
  imports: [AfDonutChartComponent],
  template: `
    <af-donut-chart
      [ariaLabel]="ariaLabel()"
      [data]="data()"
      [innerRadiusRatio]="innerRadiusRatio()"
      [centerLabel]="centerLabel()"
      [centerValue]="centerValue()"
      [showLegend]="showLegend()"
      [showPercentInLegend]="showPercentInLegend()" />
  `,
})
class HostComponent {
  ariaLabel = signal('Contract mix');
  data = signal<AfChartDatum[]>([
    { label: 'Enterprise', value: 60 },
    { label: 'Team', value: 40 },
  ]);
  innerRadiusRatio = signal(0.6);
  centerLabel = signal('');
  centerValue = signal('');
  showLegend = signal(true);
  showPercentInLegend = signal(true);
}

function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const harness = new AfDonutChartHarness(fixture.nativeElement);
  return { fixture, host: fixture.componentInstance, harness };
}

describe('AfDonutChartComponent', () => {
  describe('rendering', () => {
    it('renders an SVG with role="img" and an aria-label', () => {
      const { harness } = setup();
      expect(harness.getSvg()).not.toBeNull();
      expect(harness.getSvg()?.getAttribute('role')).toBe('img');
      expect(harness.getAriaLabel()).toContain('Contract mix');
    });

    it('renders one slice per non-zero datum', () => {
      const { harness } = setup();
      expect(harness.getSliceCount()).toBe(2);
      expect(harness.getSlicePaths()[0]).toMatch(/^M/);
    });

    it('omits zero-value slices from the ring but keeps them in legend and table', () => {
      const { fixture, host, harness } = setup();
      host.data.set([
        { label: 'Enterprise', value: 60 },
        { label: 'Team', value: 40 },
        { label: 'Trial', value: 0 },
      ]);
      fixture.detectChanges();
      // Slice count (non-zero) is strictly less than legend/table count (all data).
      expect(harness.getSliceCount()).toBe(2);
      expect(harness.getLegendLabels().length).toBe(3);
      expect(harness.getTableRowCount()).toBe(3);
    });

    it('renders no centre text in pie mode (innerRadiusRatio 0)', () => {
      const { fixture, host, harness } = setup();
      host.innerRadiusRatio.set(0);
      fixture.detectChanges();
      expect(harness.getCenterValue()).toBeNull();
      expect(harness.getCenterLabel()).toBeNull();
    });

    it('defaults the centre value to the formatted total', () => {
      const { harness } = setup();
      expect(harness.getCenterValue()).toBe('100');
    });

    it('uses an explicit centre value and label when provided', () => {
      const { fixture, host, harness } = setup();
      host.centerValue.set('€2.4k');
      host.centerLabel.set('Total');
      fixture.detectChanges();
      expect(harness.getCenterValue()).toBe('€2.4k');
      expect(harness.getCenterLabel()).toBe('Total');
    });

    it('lists every slice label in the legend', () => {
      const { harness } = setup();
      const labels = harness.getLegendLabels();
      expect(labels[0]).toContain('Enterprise');
      expect(labels[1]).toContain('Team');
    });

    it('shows percentages in the legend when enabled', () => {
      const { fixture, host, harness } = setup();
      expect(harness.getLegendLabels()[0]).toContain('60%');
      host.showPercentInLegend.set(false);
      fixture.detectChanges();
      expect(harness.getLegendLabels()[0]).not.toContain('%');
    });

    it('hides the legend when showLegend is false', () => {
      const { fixture, host, harness } = setup();
      expect(harness.getLegendLabels().length).toBe(2);
      host.showLegend.set(false);
      fixture.detectChanges();
      expect(harness.getLegendLabels().length).toBe(0);
    });
  });

  describe('empty state', () => {
    it('shows the empty message when there is no data', () => {
      const { fixture, host, harness } = setup();
      host.data.set([]);
      fixture.detectChanges();
      expect(harness.isEmpty()).toBe(true);
      expect(harness.getSvg()).toBeNull();
    });

    it('shows the empty message when all values are zero or negative', () => {
      const { fixture, host, harness } = setup();
      host.data.set([
        { label: 'A', value: 0 },
        { label: 'B', value: -5 },
      ]);
      fixture.detectChanges();
      expect(harness.isEmpty()).toBe(true);
      expect(harness.getSvg()).toBeNull();
    });
  });

  describe('accessible data table', () => {
    it('always renders a data-table mirror of the slices', () => {
      const { harness } = setup();
      expect(harness.getTable()).not.toBeNull();
      expect(harness.getTableHeaders()).toEqual(['Category', 'Value', 'Share']);
      expect(harness.getTableRowCount()).toBe(2);
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
      expect(harness.getTableHeaders()).toEqual(['Kategorie', 'Wert', 'Anteil']);
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
      host.data.set([]);
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

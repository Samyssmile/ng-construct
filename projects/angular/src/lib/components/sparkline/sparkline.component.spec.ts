import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AfSparklineComponent } from './sparkline.component';
import { AfSparklineHarness } from './sparkline.harness';
import { AF_CHART_I18N } from '../chart/chart.i18n';
import { checkA11y } from '../../testing/axe-helper';

@Component({
  imports: [AfSparklineComponent],
  template: `
    <af-sparkline
      [ariaLabel]="ariaLabel()"
      [values]="values()"
      [categories]="categories()"
      [area]="area()"
      [showLastDot]="showLastDot()" />
  `,
})
class HostComponent {
  ariaLabel = signal('Sign-ups, last 5 days');
  values = signal<number[]>([10, 30, 20, 40, 35]);
  categories = signal<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  area = signal(false);
  showLastDot = signal(true);
}

function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const harness = new AfSparklineHarness(fixture.nativeElement);
  return { fixture, host: fixture.componentInstance, harness };
}

describe('AfSparklineComponent', () => {
  describe('rendering', () => {
    it('renders an SVG with role="img" and a line path', () => {
      const { harness } = setup();
      expect(harness.getSvg()).not.toBeNull();
      expect(harness.getSvg()?.getAttribute('role')).toBe('img');
      expect(harness.getLinePath()).toMatch(/^M/);
    });

    it('adds the .ct-chart__area fill only when area is true', () => {
      const { fixture, host, harness } = setup();
      expect(harness.hasArea()).toBe(false);
      host.area.set(true);
      fixture.detectChanges();
      expect(harness.hasArea()).toBe(true);
    });

    it('renders the last-point dot only when showLastDot is true', () => {
      const { fixture, host, harness } = setup();
      expect(harness.getDotCount()).toBe(1);
      host.showLastDot.set(false);
      fixture.detectChanges();
      expect(harness.getDotCount()).toBe(0);
    });

    it('describes the trend in the aria-label with min, max and latest', () => {
      const { harness } = setup();
      const label = harness.getAriaLabel();
      expect(label).toContain('Sign-ups, last 5 days');
      expect(label).toContain('5 points');
      expect(label).toContain('min 10');
      expect(label).toContain('max 40');
      expect(label).toContain('latest 35');
    });

    it('renders a single value without error', () => {
      const { fixture, host, harness } = setup();
      host.values.set([42]);
      host.categories.set(['Only']);
      fixture.detectChanges();
      expect(harness.getSvg()).not.toBeNull();
      expect(harness.getLinePath()).toMatch(/^M/);
      expect(harness.getTableRowCount()).toBe(1);
    });
  });

  describe('empty state', () => {
    it('shows the empty message and no SVG when there are no values', () => {
      const { fixture, host, harness } = setup();
      host.values.set([]);
      host.categories.set([]);
      fixture.detectChanges();
      expect(harness.isEmpty()).toBe(true);
      expect(harness.getSvg()).toBeNull();
    });
  });

  describe('accessible data table', () => {
    it('mirrors every value as a data-table row', () => {
      const { harness } = setup();
      expect(harness.getTable()).not.toBeNull();
      expect(harness.getTableRowCount()).toBe(5);
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
      const { fixture, host, harness } = setup();
      expect(harness.getAriaLabel()).toContain('Tabelle unten.');
      host.values.set([]);
      host.categories.set([]);
      fixture.detectChanges();
      expect(harness.isEmpty()).toBe(true);
      expect(
        fixture.nativeElement.querySelector('.ct-chart__empty')?.textContent?.trim(),
      ).toBe('Keine Daten');
    });
  });

  describe('accessibility', () => {
    it('has no axe violations with data', async () => {
      const { fixture } = setup();
      await checkA11y(fixture.nativeElement);
    });

    it('has no axe violations in the empty state', async () => {
      const { fixture, host } = setup();
      host.values.set([]);
      host.categories.set([]);
      fixture.detectChanges();
      await checkA11y(fixture.nativeElement);
    });
  });
});

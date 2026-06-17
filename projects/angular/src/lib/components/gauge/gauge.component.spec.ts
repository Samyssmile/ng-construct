import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AfGaugeComponent } from './gauge.component';
import { AfGaugeHarness } from './gauge.harness';
import { AF_CHART_I18N } from '../chart/chart.i18n';
import { AfChartStatus, AfGaugeThreshold } from '../chart/chart.types';
import { checkA11y } from '../../testing/axe-helper';

@Component({
  imports: [AfGaugeComponent],
  template: `
    <af-gauge
      [ariaLabel]="ariaLabel()"
      [value]="value()"
      [min]="min()"
      [max]="max()"
      [thresholds]="thresholds()"
      [status]="status()"
      [shape]="shape()"
      [valueText]="valueText()"
      [caption]="caption()"
      [strokeWidth]="strokeWidth()"
      [showValue]="showValue()" />
  `,
})
class HostComponent {
  ariaLabel = signal('Compliance score');
  value = signal(82);
  min = signal(0);
  max = signal(100);
  thresholds = signal<AfGaugeThreshold[]>([]);
  status = signal<AfChartStatus>('default');
  shape = signal<'ring' | 'semi'>('ring');
  valueText = signal('82%');
  caption = signal('');
  strokeWidth = signal(14);
  showValue = signal(true);
}

function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const harness = new AfGaugeHarness(fixture.nativeElement);
  return { fixture, host: fixture.componentInstance, harness };
}

describe('AfGaugeComponent', () => {
  describe('meter role', () => {
    it('puts role="meter" and the value attributes on the root', () => {
      const { harness } = setup();
      expect(harness.getRole()).toBe('meter');
      expect(harness.getAriaValueNow()).toBe('82');
      expect(harness.getAriaValueMin()).toBe('0');
      expect(harness.getAriaValueMax()).toBe('100');
      expect(harness.getAriaValueText()).toBe('82%');
      expect(harness.getAriaLabel()).toBe('Compliance score');
    });

    it('marks the SVG as decorative (aria-hidden, focusable=false)', () => {
      const { harness } = setup();
      const svg = harness.getSvg();
      expect(svg?.getAttribute('aria-hidden')).toBe('true');
      expect(svg?.getAttribute('focusable')).toBe('false');
    });

    it('renders the centre value text mirroring aria-valuetext', () => {
      const { harness } = setup();
      expect(harness.getCenterText()).toBe('82%');
    });

    it('formats the value when no valueText override is given', () => {
      const { fixture, host, harness } = setup();
      host.valueText.set('');
      fixture.detectChanges();
      expect(harness.getCenterText()).toBe('82');
      expect(harness.getAriaValueText()).toBe('82');
    });

    it('keeps aria-valuetext even when the centre text is hidden', () => {
      const { fixture, host, harness } = setup();
      host.showValue.set(false);
      fixture.detectChanges();
      expect(harness.getCenterText()).toBeNull();
      expect(harness.getAriaValueText()).toBe('82%');
    });

    it('clamps aria-valuenow into [min,max] but keeps aria-valuetext truthful (above max)', () => {
      const { fixture, host, harness } = setup();
      host.valueText.set('');
      host.value.set(150);
      fixture.detectChanges();
      // WAI-ARIA requires valuenow ∈ [valuemin, valuemax]; valuetext stays raw.
      expect(harness.getAriaValueNow()).toBe('100');
      expect(harness.getAriaValueText()).toBe('150');
    });

    it('clamps aria-valuenow at the minimum for below-range values', () => {
      const { fixture, host, harness } = setup();
      host.value.set(-20);
      fixture.detectChanges();
      expect(harness.getAriaValueNow()).toBe('0');
    });
  });

  describe('value arc', () => {
    it('draws both the track and the value arc', () => {
      const { harness } = setup();
      expect(harness.getTrackPath()?.getAttribute('d')).toMatch(/^M/);
      expect(harness.getValuePath()?.getAttribute('d')).toMatch(/^M/);
    });

    it('clamps the drawn arc when the value exceeds the range', () => {
      const { fixture, host, harness } = setup();
      host.value.set(150);
      fixture.detectChanges();
      const fullValue = harness.getValuePath()?.getAttribute('d');

      host.value.set(100);
      fixture.detectChanges();
      const maxValue = harness.getValuePath()?.getAttribute('d');

      // A value of 150 is clamped to the [0,100] range, so the arc matches 100.
      expect(fullValue).toBe(maxValue);
    });

    it('still renders a full value arc at the maximum (ring does not vanish)', () => {
      const { fixture, host, harness } = setup();
      host.value.set(100);
      fixture.detectChanges();
      expect(harness.getValuePath()).not.toBeNull();
      expect(harness.getValuePath()?.getAttribute('d')).toMatch(/^M/);
    });

    it('omits the value arc when the value is at the minimum', () => {
      const { fixture, host, harness } = setup();
      host.value.set(0);
      fixture.detectChanges();
      expect(harness.getValuePath()).toBeNull();
      expect(harness.getTrackPath()).not.toBeNull();
    });

    it('drives arc thickness through the --ct-chart-gauge-width custom property', () => {
      const { fixture, host, harness } = setup();
      expect(harness.getGaugeWidth()).toBe('14px');
      host.strokeWidth.set(24);
      fixture.detectChanges();
      // The input now flows to the CSS variable the design layer reads, instead
      // of a presentation attribute the class selector would override.
      expect(harness.getGaugeWidth()).toBe('24px');
    });
  });

  describe('status colour', () => {
    it('uses the explicit status when no threshold matches', () => {
      const { fixture, host, harness } = setup();
      host.status.set('warning');
      fixture.detectChanges();
      expect(harness.getValueStatusClass()).toBe('warning');
    });

    it('selects the highest matching threshold band', () => {
      const { fixture, host, harness } = setup();
      host.thresholds.set([
        { from: 0, status: 'success' },
        { from: 80, status: 'warning' },
        { from: 90, status: 'danger' },
      ]);
      host.value.set(95);
      fixture.detectChanges();
      expect(harness.getValueStatusClass()).toBe('danger');

      host.value.set(85);
      fixture.detectChanges();
      expect(harness.getValueStatusClass()).toBe('warning');

      host.value.set(40);
      fixture.detectChanges();
      expect(harness.getValueStatusClass()).toBe('success');
    });

    it('falls back to the status input when no band is below the value', () => {
      const { fixture, host, harness } = setup();
      host.thresholds.set([{ from: 50, status: 'danger' }]);
      host.status.set('success');
      host.value.set(20);
      fixture.detectChanges();
      expect(harness.getValueStatusClass()).toBe('success');
    });
  });

  describe('shape', () => {
    it('renders a value path for the ring shape', () => {
      const { harness } = setup();
      expect(harness.getValuePath()?.getAttribute('d')).toMatch(/^M/);
    });

    it('renders a value path for the semi shape', () => {
      const { fixture, host, harness } = setup();
      host.shape.set('semi');
      fixture.detectChanges();
      expect(harness.getValuePath()?.getAttribute('d')).toMatch(/^M/);
    });
  });

  describe('caption', () => {
    it('renders a caption when provided', () => {
      const { fixture, host, harness } = setup();
      host.caption.set('Compliance');
      fixture.detectChanges();
      expect(harness.getCaption()).toBe('Compliance');
    });

    it('omits the caption when empty', () => {
      const { harness } = setup();
      expect(harness.getCaption()).toBeNull();
    });
  });

  describe('empty state', () => {
    it('shows the empty message and drops the meter role when max <= min', () => {
      const { fixture, host, harness } = setup();
      host.max.set(0);
      fixture.detectChanges();
      expect(harness.isEmpty()).toBe(true);
      expect(harness.getSvg()).toBeNull();
      expect(harness.getRole()).toBeNull();
      expect(harness.getAriaValueNow()).toBeNull();
    });
  });

  describe('i18n', () => {
    it('uses the overridden noData string from AF_CHART_I18N', () => {
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
      const { fixture, host } = setup();
      host.max.set(0);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.ct-chart__empty')?.textContent?.trim()).toBe(
        'Keine Daten',
      );
    });
  });

  describe('accessibility', () => {
    it('has no axe violations with data', async () => {
      const { fixture } = setup();
      await checkA11y(fixture.nativeElement);
    });

    it('has no axe violations in the empty state', async () => {
      const { fixture, host } = setup();
      host.max.set(0);
      fixture.detectChanges();
      await checkA11y(fixture.nativeElement);
    });
  });
});

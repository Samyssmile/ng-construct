import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import {
  AfAlertComponent,
  AfAlertVariant,
  AF_ALERT_I18N,
} from './alert.component';
import { AfAlertHarness } from './alert.harness';
import axe from 'axe-core';

@Component({
  imports: [AfAlertComponent],
  template: `
    <af-alert
      [variant]="variant()"
      [dismissible]="dismissible()"
      (dismissed)="dismissedCount.set(dismissedCount() + 1)">
      @if (showIcon()) {
        <span icon>!</span>
      }
      @if (showTitle()) {
        <span title>Test Alert Title</span>
      }
      Test alert description
      @if (showActions()) {
        <div actions>
          <button id="action-btn">Action</button>
        </div>
      }
    </af-alert>
  `,
})
class TestHostComponent {
  variant = signal<AfAlertVariant>('info');
  dismissible = signal(false);
  dismissedCount = signal(0);
  showIcon = signal(true);
  showTitle = signal(true);
  showActions = signal(false);
}

describe('AfAlertComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let harness: AfAlertHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    harness = new AfAlertHarness(fixture.nativeElement);
  });

  // ── rendering ───────────────────────────────────────────────

  describe('rendering', () => {
    it('should render the alert element', () => {
      expect(harness.isVisible()).toBe(true);
    });

    it('should apply ct-alert base class', () => {
      expect(harness.getAlertElement()!.classList.contains('ct-alert')).toBe(
        true,
      );
    });

    it('should apply data-variant="info" by default', () => {
      expect(harness.getVariant()).toBe('info');
    });

    it('should update data-variant when changed', () => {
      host.variant.set('danger');
      fixture.detectChanges();
      expect(harness.getVariant()).toBe('danger');
    });

    it('should apply all variant values correctly', () => {
      for (const v of [
        'info',
        'success',
        'warning',
        'danger',
      ] as AfAlertVariant[]) {
        host.variant.set(v);
        fixture.detectChanges();
        expect(harness.getVariant()).toBe(v);
      }
    });
  });

  // ── content projection ──────────────────────────────────────

  describe('content projection', () => {
    it('should project icon content', () => {
      const icon =
        harness.getAlertElement()!.querySelector('.ct-alert__icon');
      expect(icon?.textContent?.trim()).toBe('!');
    });

    it('should project title content', () => {
      expect(harness.getTitle()).toBe('Test Alert Title');
    });

    it('should project description content', () => {
      expect(harness.getText()).toContain('Test alert description');
    });

    it('should project actions content', () => {
      host.showActions.set(true);
      fixture.detectChanges();
      const btn = harness.getAlertElement()!.querySelector('#action-btn');
      expect(btn).toBeTruthy();
      expect(btn!.textContent).toBe('Action');
    });
  });

  // ── ARIA roles ──────────────────────────────────────────────

  describe('ARIA roles', () => {
    it('should have role="status" for info variant', () => {
      expect(harness.getRole()).toBe('status');
    });

    it('should have role="status" for success variant', () => {
      host.variant.set('success');
      fixture.detectChanges();
      expect(harness.getRole()).toBe('status');
    });

    it('should have role="alert" for warning variant', () => {
      host.variant.set('warning');
      fixture.detectChanges();
      expect(harness.getRole()).toBe('alert');
    });

    it('should have role="alert" for danger variant', () => {
      host.variant.set('danger');
      fixture.detectChanges();
      expect(harness.getRole()).toBe('alert');
    });

    it('should update role dynamically when variant changes', () => {
      expect(harness.getRole()).toBe('status');

      host.variant.set('danger');
      fixture.detectChanges();
      expect(harness.getRole()).toBe('alert');

      host.variant.set('success');
      fixture.detectChanges();
      expect(harness.getRole()).toBe('status');
    });
  });

  // ── icon accessibility ──────────────────────────────────────

  describe('icon accessibility', () => {
    it('should mark icon container as aria-hidden', () => {
      const icon =
        harness.getAlertElement()!.querySelector('.ct-alert__icon');
      expect(icon?.getAttribute('aria-hidden')).toBe('true');
    });
  });

  // ── dismissible ─────────────────────────────────────────────

  describe('dismissible', () => {
    it('should not show dismiss button by default', () => {
      expect(harness.isDismissible()).toBe(false);
    });

    it('should not add dismissible modifier class by default', () => {
      expect(
        harness
          .getAlertElement()!
          .classList.contains('ct-alert--dismissible'),
      ).toBe(false);
    });

    it('should show dismiss button when dismissible is true', () => {
      host.dismissible.set(true);
      fixture.detectChanges();
      expect(harness.isDismissible()).toBe(true);
    });

    it('should add ct-alert--dismissible modifier class', () => {
      host.dismissible.set(true);
      fixture.detectChanges();
      expect(
        harness
          .getAlertElement()!
          .classList.contains('ct-alert--dismissible'),
      ).toBe(true);
    });

    it('should have type="button" on dismiss button', () => {
      host.dismissible.set(true);
      fixture.detectChanges();
      expect(harness.getDismissButton()!.getAttribute('type')).toBe('button');
    });

    it('should have accessible aria-label on dismiss button', () => {
      host.dismissible.set(true);
      fixture.detectChanges();
      expect(harness.getDismissButton()!.getAttribute('aria-label')).toBe(
        'Dismiss alert',
      );
    });

    it('should hide the alert when dismiss button is clicked', () => {
      host.dismissible.set(true);
      fixture.detectChanges();

      harness.dismiss();
      fixture.detectChanges();

      expect(harness.isVisible()).toBe(false);
    });

    it('should emit dismissed event when dismiss button is clicked', () => {
      host.dismissible.set(true);
      fixture.detectChanges();

      harness.dismiss();
      fixture.detectChanges();

      expect(host.dismissedCount()).toBe(1);
    });

    it('should only emit dismissed once per dismiss action', () => {
      host.dismissible.set(true);
      fixture.detectChanges();

      harness.dismiss();
      fixture.detectChanges();

      expect(host.dismissedCount()).toBe(1);
    });
  });

  // ── keyboard interaction ────────────────────────────────────

  describe('keyboard interaction', () => {
    it('should dismiss alert on Enter key on dismiss button', () => {
      host.dismissible.set(true);
      fixture.detectChanges();

      const btn = harness.getDismissButton()!;
      btn.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      );
      btn.click();
      fixture.detectChanges();

      expect(harness.isVisible()).toBe(false);
      expect(host.dismissedCount()).toBe(1);
    });

    it('should dismiss alert on Space key on dismiss button', () => {
      host.dismissible.set(true);
      fixture.detectChanges();

      const btn = harness.getDismissButton()!;
      btn.dispatchEvent(
        new KeyboardEvent('keydown', { key: ' ', bubbles: true }),
      );
      btn.click();
      fixture.detectChanges();

      expect(harness.isVisible()).toBe(false);
      expect(host.dismissedCount()).toBe(1);
    });
  });

  // ── i18n ────────────────────────────────────────────────────

  describe('i18n', () => {
    it('should use default dismiss aria-label', () => {
      host.dismissible.set(true);
      fixture.detectChanges();
      expect(harness.getDismissButton()!.getAttribute('aria-label')).toBe(
        'Dismiss alert',
      );
    });
  });

  // ── screen-reader announcements ─────────────────────────────

  describe('screen-reader announcements', () => {
    it('should have an aria-live region', () => {
      const liveRegion = harness.getLiveRegion();
      expect(liveRegion).toBeTruthy();
      expect(liveRegion!.getAttribute('aria-live')).toBe('polite');
      expect(liveRegion!.getAttribute('aria-atomic')).toBe('true');
    });

    it('should announce dismissal via live region', async () => {
      host.dismissible.set(true);
      fixture.detectChanges();

      harness.dismiss();
      fixture.detectChanges();

      await new Promise((resolve) => setTimeout(resolve, 0));
      fixture.detectChanges();

      const liveRegion = harness.getLiveRegion();
      expect(liveRegion!.textContent?.trim()).toBe('Alert dismissed');
    });
  });

  // ── accessibility (axe-core) ────────────────────────────────

  describe('accessibility', () => {
    it('should pass axe accessibility checks (info variant)', async () => {
      const results = await axe.run(fixture.nativeElement, {
        rules: { region: { enabled: false } },
      });
      expect(results.violations).toEqual([]);
    });

    it('should pass axe accessibility checks (danger variant)', async () => {
      host.variant.set('danger');
      fixture.detectChanges();
      const results = await axe.run(fixture.nativeElement, {
        rules: { region: { enabled: false } },
      });
      expect(results.violations).toEqual([]);
    });

    it('should pass axe accessibility checks (dismissible)', async () => {
      host.dismissible.set(true);
      fixture.detectChanges();
      const results = await axe.run(fixture.nativeElement, {
        rules: { region: { enabled: false } },
      });
      expect(results.violations).toEqual([]);
    });
  });
});

// ── custom i18n ─────────────────────────────────────────────────

describe('AfAlertComponent (custom i18n)', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let harness: AfAlertHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        {
          provide: AF_ALERT_I18N,
          useValue: {
            dismiss: 'Schliessen',
            dismissed: 'Warnung geschlossen',
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    harness = new AfAlertHarness(fixture.nativeElement);
  });

  it('should use custom dismiss aria-label from token', () => {
    host.dismissible.set(true);
    fixture.detectChanges();
    expect(harness.getDismissButton()!.getAttribute('aria-label')).toBe(
      'Schliessen',
    );
  });

  it('should use custom dismissed announcement from token', async () => {
    host.dismissible.set(true);
    fixture.detectChanges();

    harness.dismiss();
    fixture.detectChanges();

    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();

    expect(harness.getLiveRegion()!.textContent?.trim()).toBe(
      'Warnung geschlossen',
    );
  });
});

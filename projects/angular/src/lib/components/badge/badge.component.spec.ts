import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { AfBadgeComponent, AfBadgeVariant } from './badge.component';
import { AfBadgeHarness } from './badge.harness';
import { checkA11y } from '../../testing/axe-helper';

@Component({
  imports: [AfBadgeComponent],
  template: `
    <af-badge
      [variant]="variant()"
      [icon]="icon()"
      [dot]="dot()"
      [role]="role()"
      [ariaLabel]="ariaLabel()">
      {{ content() }}
    </af-badge>
  `,
})
class TestHostComponent {
  variant = signal<AfBadgeVariant>('default');
  icon = signal('');
  dot = signal(false);
  role = signal('');
  ariaLabel = signal('');
  content = signal('Active');
}

describe('AfBadgeComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let harness: AfBadgeHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    harness = new AfBadgeHarness(fixture.nativeElement);
  });

  // ── rendering ──────────────────────────────────────────────

  describe('rendering', () => {
    it('should apply the ct-badge base class', () => {
      expect(harness.hasClass('ct-badge')).toBe(true);
    });

    it('should project text content', () => {
      expect(harness.getText()).toBe('Active');
    });

    it('should update projected content when changed', () => {
      host.content.set('Inactive');
      fixture.detectChanges();
      expect(harness.getText()).toBe('Inactive');
    });
  });

  // ── variants ───────────────────────────────────────────────

  describe('variants', () => {
    it('should not add a variant modifier class for default', () => {
      expect(harness.getClasses()).toBe('ct-badge');
    });

    const nonDefaultVariants: AfBadgeVariant[] = ['info', 'success', 'warning', 'danger'];

    for (const v of nonDefaultVariants) {
      it(`should add ct-badge--${v} for variant "${v}"`, () => {
        host.variant.set(v);
        fixture.detectChanges();
        expect(harness.hasClass(`ct-badge--${v}`)).toBe(true);
        expect(harness.hasClass('ct-badge')).toBe(true);
      });
    }
  });

  // ── icon mode ──────────────────────────────────────────────

  describe('icon mode', () => {
    it('should not show icon element by default', () => {
      expect(harness.hasIcon()).toBe(false);
    });

    it('should show icon element when icon is set', () => {
      host.icon.set('+');
      fixture.detectChanges();
      expect(harness.hasIcon()).toBe(true);
    });

    it('should render icon text', () => {
      host.icon.set('!');
      fixture.detectChanges();
      expect(harness.getIconText()).toBe('!');
    });

    it('should add ct-badge--icon class when icon is set', () => {
      host.icon.set('+');
      fixture.detectChanges();
      expect(harness.hasClass('ct-badge--icon')).toBe(true);
    });

    it('should mark icon element as aria-hidden', () => {
      host.icon.set('+');
      fixture.detectChanges();
      const iconEl = fixture.nativeElement.querySelector('.ct-badge__icon');
      expect(iconEl.getAttribute('aria-hidden')).toBe('true');
    });
  });

  // ── dot mode ───────────────────────────────────────────────

  describe('dot mode', () => {
    it('should not show dot element by default', () => {
      expect(harness.hasDot()).toBe(false);
    });

    it('should show dot element when dot is true', () => {
      host.dot.set(true);
      fixture.detectChanges();
      expect(harness.hasDot()).toBe(true);
    });

    it('should add ct-badge--icon class when dot is true', () => {
      host.dot.set(true);
      fixture.detectChanges();
      expect(harness.hasClass('ct-badge--icon')).toBe(true);
    });

    it('should mark dot element as aria-hidden', () => {
      host.dot.set(true);
      fixture.detectChanges();
      const dotEl = fixture.nativeElement.querySelector('.ct-badge__dot');
      expect(dotEl.getAttribute('aria-hidden')).toBe('true');
    });
  });

  // ── ARIA attributes ────────────────────────────────────────

  describe('ARIA attributes', () => {
    it('should not set aria-label when empty', () => {
      expect(harness.getAriaLabel()).toBeNull();
    });

    it('should set aria-label when provided', () => {
      host.ariaLabel.set('Status: active');
      fixture.detectChanges();
      expect(harness.getAriaLabel()).toBe('Status: active');
    });

    it('should not set role when empty', () => {
      expect(harness.getRole()).toBeNull();
    });

    it('should set role when provided', () => {
      host.role.set('status');
      fixture.detectChanges();
      expect(harness.getRole()).toBe('status');
    });
  });

  // ── class combinations ─────────────────────────────────────

  describe('class combinations', () => {
    it('should combine variant and icon modifiers', () => {
      host.variant.set('danger');
      host.icon.set('!');
      fixture.detectChanges();

      expect(harness.hasClass('ct-badge')).toBe(true);
      expect(harness.hasClass('ct-badge--danger')).toBe(true);
      expect(harness.hasClass('ct-badge--icon')).toBe(true);
    });

    it('should combine variant and dot modifiers', () => {
      host.variant.set('success');
      host.dot.set(true);
      fixture.detectChanges();

      expect(harness.hasClass('ct-badge')).toBe(true);
      expect(harness.hasClass('ct-badge--success')).toBe(true);
      expect(harness.hasClass('ct-badge--icon')).toBe(true);
    });
  });

  // ── accessibility (axe-core) ───────────────────────────────

  describe('Accessibility (axe-core)', () => {
    it('should have no violations in default state', async () => {
      await checkA11y(fixture.nativeElement);
    });

    it('should have no violations with icon', async () => {
      host.icon.set('+');
      fixture.detectChanges();
      await checkA11y(fixture.nativeElement);
    });

    it('should have no violations with dot', async () => {
      host.dot.set(true);
      fixture.detectChanges();
      await checkA11y(fixture.nativeElement);
    });

    it('should have no violations with role="status"', async () => {
      host.role.set('status');
      fixture.detectChanges();
      await checkA11y(fixture.nativeElement);
    });

    for (const v of ['info', 'success', 'warning', 'danger'] as AfBadgeVariant[]) {
      it(`should have no violations for variant "${v}"`, async () => {
        host.variant.set(v);
        fixture.detectChanges();
        await checkA11y(fixture.nativeElement);
      });
    }
  });
});

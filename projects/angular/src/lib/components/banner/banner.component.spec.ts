import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import {
  AfBannerComponent,
  AfBannerVariant,
  AfBannerAppearance,
  AfBannerPosition,
} from './banner.component';

@Component({
  imports: [AfBannerComponent],
  template: `
    <af-banner
      [variant]="variant()"
      [appearance]="appearance()"
      [position]="position()"
      [dismissible]="dismissible()"
      [compact]="compact()"
      [full]="full()"
      [autoClose]="autoClose()"
      [closeAriaLabel]="closeAriaLabel()"
      (dismissed)="dismissedCount.set(dismissedCount() + 1)">
      @if (showIcon()) {
        <span icon>⚠️</span>
      }
      @if (showHeading()) {
        <span heading>Test Heading</span>
      }
      @if (showMessage()) {
        <span message>Test message body.</span>
      }
      @if (showActions()) {
        <div actions>
          <button id="action-btn">Fix</button>
        </div>
      }
    </af-banner>
  `,
})
class TestHostComponent {
  variant = signal<AfBannerVariant>('info');
  appearance = signal<AfBannerAppearance>('subtle');
  position = signal<AfBannerPosition>('inline');
  dismissible = signal(false);
  compact = signal(false);
  full = signal(false);
  autoClose = signal(0);
  closeAriaLabel = signal('Close banner');
  dismissedCount = signal(0);
  showIcon = signal(true);
  showHeading = signal(true);
  showMessage = signal(true);
  showActions = signal(false);
}

describe('AfBannerComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function getBannerEl(): HTMLElement {
    return fixture.nativeElement.querySelector('.ct-banner');
  }

  describe('rendering', () => {
    it('should render with data-state="open" by default', () => {
      expect(getBannerEl().getAttribute('data-state')).toBe('open');
    });

    it('should apply the default ct-banner class', () => {
      expect(getBannerEl().classList.contains('ct-banner')).toBe(true);
    });

    it('should default to info variant', () => {
      expect(getBannerEl().getAttribute('data-variant')).toBe('info');
    });

    it('should apply warning variant', () => {
      host.variant.set('warning');
      fixture.detectChanges();
      expect(getBannerEl().getAttribute('data-variant')).toBe('warning');
    });

    it('should apply danger variant', () => {
      host.variant.set('danger');
      fixture.detectChanges();
      expect(getBannerEl().getAttribute('data-variant')).toBe('danger');
    });

    it('should apply success variant', () => {
      host.variant.set('success');
      fixture.detectChanges();
      expect(getBannerEl().getAttribute('data-variant')).toBe('success');
    });

    it('should apply neutral variant', () => {
      host.variant.set('neutral');
      fixture.detectChanges();
      expect(getBannerEl().getAttribute('data-variant')).toBe('neutral');
    });

    it('should not apply appearance class for default subtle', () => {
      expect(getBannerEl().classList.contains('ct-banner--subtle')).toBe(false);
    });

    it('should apply solid appearance class', () => {
      host.appearance.set('solid');
      fixture.detectChanges();
      expect(getBannerEl().classList.contains('ct-banner--solid')).toBe(true);
    });

    it('should apply left-accent appearance class', () => {
      host.appearance.set('left-accent');
      fixture.detectChanges();
      expect(getBannerEl().classList.contains('ct-banner--left-accent')).toBe(true);
    });

    it('should apply top-accent appearance class', () => {
      host.appearance.set('top-accent');
      fixture.detectChanges();
      expect(getBannerEl().classList.contains('ct-banner--top-accent')).toBe(true);
    });

    it('should not apply position class for default inline', () => {
      expect(getBannerEl().classList.contains('ct-banner--inline')).toBe(false);
    });

    it('should apply fixed-top position class', () => {
      host.position.set('fixed-top');
      fixture.detectChanges();
      expect(getBannerEl().classList.contains('ct-banner--fixed-top')).toBe(true);
    });

    it('should apply fixed-bottom position class', () => {
      host.position.set('fixed-bottom');
      fixture.detectChanges();
      expect(getBannerEl().classList.contains('ct-banner--fixed-bottom')).toBe(true);
    });

    it('should apply sticky position class', () => {
      host.position.set('sticky');
      fixture.detectChanges();
      expect(getBannerEl().classList.contains('ct-banner--sticky')).toBe(true);
    });

    it('should apply compact class', () => {
      host.compact.set(true);
      fixture.detectChanges();
      expect(getBannerEl().classList.contains('ct-banner--compact')).toBe(true);
    });

    it('should apply full class', () => {
      host.full.set(true);
      fixture.detectChanges();
      expect(getBannerEl().classList.contains('ct-banner--full')).toBe(true);
    });

    it('should combine multiple classes', () => {
      host.appearance.set('solid');
      host.position.set('sticky');
      host.compact.set(true);
      host.full.set(true);
      fixture.detectChanges();

      const el = getBannerEl();
      expect(el.classList.contains('ct-banner')).toBe(true);
      expect(el.classList.contains('ct-banner--solid')).toBe(true);
      expect(el.classList.contains('ct-banner--sticky')).toBe(true);
      expect(el.classList.contains('ct-banner--compact')).toBe(true);
      expect(el.classList.contains('ct-banner--full')).toBe(true);
    });
  });

  describe('ARIA', () => {
    it('should set role="status" for info variant', () => {
      expect(getBannerEl().getAttribute('role')).toBe('status');
    });

    it('should set role="status" for success variant', () => {
      host.variant.set('success');
      fixture.detectChanges();
      expect(getBannerEl().getAttribute('role')).toBe('status');
    });

    it('should set role="status" for neutral variant', () => {
      host.variant.set('neutral');
      fixture.detectChanges();
      expect(getBannerEl().getAttribute('role')).toBe('status');
    });

    it('should set role="alert" for warning variant', () => {
      host.variant.set('warning');
      fixture.detectChanges();
      expect(getBannerEl().getAttribute('role')).toBe('alert');
    });

    it('should set role="alert" for danger variant', () => {
      host.variant.set('danger');
      fixture.detectChanges();
      expect(getBannerEl().getAttribute('role')).toBe('alert');
    });
  });

  describe('dismiss', () => {
    it('should not show close button when dismissible is false', () => {
      const btn = getBannerEl().querySelector('.ct-banner__close');
      expect(btn).toBeNull();
    });

    it('should show close button when dismissible is true', () => {
      host.dismissible.set(true);
      fixture.detectChanges();
      const btn = getBannerEl().querySelector('.ct-banner__close');
      expect(btn).toBeTruthy();
    });

    it('should set aria-label on close button', () => {
      host.dismissible.set(true);
      fixture.detectChanges();
      const btn = getBannerEl().querySelector('.ct-banner__close');
      expect(btn?.getAttribute('aria-label')).toBe('Close banner');
    });

    it('should use custom close aria label', () => {
      host.dismissible.set(true);
      host.closeAriaLabel.set('Dismiss notification');
      fixture.detectChanges();
      const btn = getBannerEl().querySelector('.ct-banner__close');
      expect(btn?.getAttribute('aria-label')).toBe('Dismiss notification');
    });

    it('should set data-state to closed on dismiss', () => {
      host.dismissible.set(true);
      fixture.detectChanges();

      const btn = getBannerEl().querySelector<HTMLButtonElement>('.ct-banner__close')!;
      btn.click();
      fixture.detectChanges();

      expect(getBannerEl().getAttribute('data-state')).toBe('closed');
    });

    it('should emit dismissed event on dismiss', () => {
      host.dismissible.set(true);
      fixture.detectChanges();

      const btn = getBannerEl().querySelector<HTMLButtonElement>('.ct-banner__close')!;
      btn.click();
      fixture.detectChanges();

      expect(host.dismissedCount()).toBe(1);
    });

    it('should only emit dismissed once on multiple clicks', () => {
      host.dismissible.set(true);
      fixture.detectChanges();

      const btn = getBannerEl().querySelector<HTMLButtonElement>('.ct-banner__close')!;
      btn.click();
      btn.click();
      fixture.detectChanges();

      expect(host.dismissedCount()).toBe(1);
    });
  });

  describe('auto-close', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should auto-dismiss after specified delay', () => {
      host.autoClose.set(3000);
      fixture.detectChanges();

      expect(getBannerEl().getAttribute('data-state')).toBe('open');

      vi.advanceTimersByTime(3000);
      fixture.detectChanges();

      expect(getBannerEl().getAttribute('data-state')).toBe('closed');
      expect(host.dismissedCount()).toBe(1);
    });

    it('should not auto-dismiss when autoClose is 0', () => {
      vi.advanceTimersByTime(10000);
      fixture.detectChanges();
      expect(getBannerEl().getAttribute('data-state')).toBe('open');
    });

    it('should clear timer on manual dismiss', () => {
      host.dismissible.set(true);
      host.autoClose.set(5000);
      fixture.detectChanges();

      const btn = getBannerEl().querySelector<HTMLButtonElement>('.ct-banner__close')!;
      btn.click();
      fixture.detectChanges();

      expect(host.dismissedCount()).toBe(1);

      vi.advanceTimersByTime(5000);
      fixture.detectChanges();

      // Should still be 1 — auto-close timer was cleared
      expect(host.dismissedCount()).toBe(1);
    });
  });

  describe('content projection', () => {
    it('should project icon content into ct-banner__icon wrapper', () => {
      fixture.detectChanges();
      const iconWrapper = getBannerEl().querySelector('.ct-banner__icon');
      expect(iconWrapper).toBeTruthy();
      expect(iconWrapper?.textContent?.trim()).toBe('⚠️');
    });

    it('should project heading content into ct-banner__title wrapper', () => {
      fixture.detectChanges();
      const titleWrapper = getBannerEl().querySelector('.ct-banner__title');
      expect(titleWrapper).toBeTruthy();
      expect(titleWrapper?.textContent?.trim()).toBe('Test Heading');
    });

    it('should project message content into ct-banner__message wrapper', () => {
      fixture.detectChanges();
      const messageWrapper = getBannerEl().querySelector('.ct-banner__message');
      expect(messageWrapper).toBeTruthy();
      expect(messageWrapper?.textContent?.trim()).toBe('Test message body.');
    });

    it('should project actions content into ct-banner__actions wrapper', () => {
      host.showActions.set(true);
      fixture.detectChanges();
      const actionsWrapper = getBannerEl().querySelector('.ct-banner__actions');
      expect(actionsWrapper).toBeTruthy();
      expect(actionsWrapper?.querySelector('#action-btn')).toBeTruthy();
    });

    it('should always render ct-banner__content wrapper', () => {
      const contentWrapper = getBannerEl().querySelector('.ct-banner__content');
      expect(contentWrapper).toBeTruthy();
    });
  });
});

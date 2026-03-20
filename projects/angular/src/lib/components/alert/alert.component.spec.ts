import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { AfAlertComponent, AfAlertVariant } from './alert.component';

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function getAlertEl(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.ct-alert');
  }

  function getDismissBtn(): HTMLButtonElement | null {
    return fixture.nativeElement.querySelector('.af-alert__dismiss');
  }

  describe('rendering', () => {
    it('should render the alert element', () => {
      expect(getAlertEl()).toBeTruthy();
    });

    it('should apply ct-alert base class', () => {
      expect(getAlertEl()!.classList.contains('ct-alert')).toBe(true);
    });

    it('should apply data-variant="info" by default', () => {
      expect(getAlertEl()!.getAttribute('data-variant')).toBe('info');
    });

    it('should update data-variant when changed', () => {
      host.variant.set('danger');
      fixture.detectChanges();
      expect(getAlertEl()!.getAttribute('data-variant')).toBe('danger');
    });

    it('should apply all variant values correctly', () => {
      for (const v of ['info', 'success', 'warning', 'danger'] as AfAlertVariant[]) {
        host.variant.set(v);
        fixture.detectChanges();
        expect(getAlertEl()!.getAttribute('data-variant')).toBe(v);
      }
    });
  });

  describe('content projection', () => {
    it('should project icon content', () => {
      const icon = getAlertEl()!.querySelector('.ct-alert__icon');
      expect(icon?.textContent?.trim()).toBe('!');
    });

    it('should project title content', () => {
      const title = getAlertEl()!.querySelector('.ct-alert__title');
      expect(title?.textContent?.trim()).toBe('Test Alert Title');
    });

    it('should project description content', () => {
      const desc = getAlertEl()!.querySelector('.ct-alert__description');
      expect(desc?.textContent).toContain('Test alert description');
    });

    it('should project actions content', () => {
      host.showActions.set(true);
      fixture.detectChanges();
      const btn = getAlertEl()!.querySelector('#action-btn');
      expect(btn).toBeTruthy();
      expect(btn!.textContent).toBe('Action');
    });
  });

  describe('ARIA roles', () => {
    it('should have role="status" for info variant', () => {
      expect(getAlertEl()!.getAttribute('role')).toBe('status');
    });

    it('should have role="status" for success variant', () => {
      host.variant.set('success');
      fixture.detectChanges();
      expect(getAlertEl()!.getAttribute('role')).toBe('status');
    });

    it('should have role="alert" for warning variant', () => {
      host.variant.set('warning');
      fixture.detectChanges();
      expect(getAlertEl()!.getAttribute('role')).toBe('alert');
    });

    it('should have role="alert" for danger variant', () => {
      host.variant.set('danger');
      fixture.detectChanges();
      expect(getAlertEl()!.getAttribute('role')).toBe('alert');
    });

    it('should update role dynamically when variant changes', () => {
      expect(getAlertEl()!.getAttribute('role')).toBe('status');

      host.variant.set('danger');
      fixture.detectChanges();
      expect(getAlertEl()!.getAttribute('role')).toBe('alert');

      host.variant.set('success');
      fixture.detectChanges();
      expect(getAlertEl()!.getAttribute('role')).toBe('status');
    });
  });

  describe('icon accessibility', () => {
    it('should mark icon container as aria-hidden', () => {
      const icon = getAlertEl()!.querySelector('.ct-alert__icon');
      expect(icon?.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('dismissible', () => {
    it('should not show dismiss button by default', () => {
      expect(getDismissBtn()).toBeNull();
    });

    it('should not add dismissible modifier class by default', () => {
      expect(getAlertEl()!.classList.contains('ct-alert--dismissible')).toBe(false);
    });

    it('should show dismiss button when dismissible is true', () => {
      host.dismissible.set(true);
      fixture.detectChanges();
      expect(getDismissBtn()).toBeTruthy();
    });

    it('should add ct-alert--dismissible modifier class', () => {
      host.dismissible.set(true);
      fixture.detectChanges();
      expect(getAlertEl()!.classList.contains('ct-alert--dismissible')).toBe(true);
    });

    it('should have type="button" on dismiss button', () => {
      host.dismissible.set(true);
      fixture.detectChanges();
      expect(getDismissBtn()!.getAttribute('type')).toBe('button');
    });

    it('should have accessible aria-label on dismiss button', () => {
      host.dismissible.set(true);
      fixture.detectChanges();
      expect(getDismissBtn()!.getAttribute('aria-label')).toBe('Dismiss alert');
    });

    it('should hide the alert when dismiss button is clicked', () => {
      host.dismissible.set(true);
      fixture.detectChanges();

      getDismissBtn()!.click();
      fixture.detectChanges();

      expect(getAlertEl()).toBeNull();
    });

    it('should emit dismissed event when dismiss button is clicked', () => {
      host.dismissible.set(true);
      fixture.detectChanges();

      getDismissBtn()!.click();
      fixture.detectChanges();

      expect(host.dismissedCount()).toBe(1);
    });

    it('should only emit dismissed once per dismiss action', () => {
      host.dismissible.set(true);
      fixture.detectChanges();

      getDismissBtn()!.click();
      fixture.detectChanges();

      expect(host.dismissedCount()).toBe(1);
    });
  });
});

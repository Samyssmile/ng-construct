import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { AfDrawerComponent } from './drawer.component';

@Component({
  imports: [AfDrawerComponent],
  template: `
    <button #trigger (click)="open.set(true)">Open</button>
    <af-drawer
      [(open)]="open"
      [position]="position()"
      [size]="size()"
      [ariaLabel]="ariaLabel()"
      [showCloseButton]="showCloseButton()"
      [closeOnBackdropClick]="closeOnBackdropClick()"
      (closed)="closedCount.set(closedCount() + 1)">
      <div header>
        <h2>Test Drawer</h2>
      </div>
      <div body>
        <input id="first-input" type="text" />
        <button id="inner-btn">Action</button>
      </div>
      <div footer>
        <button id="cancel-btn">Cancel</button>
      </div>
    </af-drawer>
  `,
})
class TestHostComponent {
  open = signal(false);
  position = signal<'right' | 'left' | 'top' | 'bottom'>('right');
  size = signal<'sm' | 'md' | 'lg' | 'full'>('md');
  ariaLabel = signal('Test drawer');
  showCloseButton = signal(true);
  closeOnBackdropClick = signal(true);
  closedCount = signal(0);
}

describe('AfDrawerComponent', () => {
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

  afterEach(() => {
    document.body.style.overflow = '';
  });

  function getDrawerEl(): HTMLElement {
    return fixture.nativeElement.querySelector('.ct-drawer');
  }

  function getPanelEl(): HTMLElement {
    return fixture.nativeElement.querySelector('.ct-drawer__panel');
  }

  function openDrawer(): void {
    host.open.set(true);
    fixture.detectChanges();
  }

  describe('rendering', () => {
    it('should render with data-state="closed" by default', () => {
      expect(getDrawerEl().getAttribute('data-state')).toBe('closed');
    });

    it('should set data-state="open" when open', () => {
      openDrawer();
      expect(getDrawerEl().getAttribute('data-state')).toBe('open');
    });

    it('should apply the default ct-drawer class without position modifier for right', () => {
      openDrawer();
      const el = getDrawerEl();
      expect(el.classList.contains('ct-drawer')).toBe(true);
      expect(el.classList.contains('ct-drawer--right')).toBe(false);
    });

    it('should apply position class for left', () => {
      host.position.set('left');
      openDrawer();
      expect(getDrawerEl().classList.contains('ct-drawer--left')).toBe(true);
    });

    it('should apply position class for bottom', () => {
      host.position.set('bottom');
      openDrawer();
      expect(getDrawerEl().classList.contains('ct-drawer--bottom')).toBe(true);
    });

    it('should apply position class for top', () => {
      host.position.set('top');
      openDrawer();
      expect(getDrawerEl().classList.contains('ct-drawer--top')).toBe(true);
    });

    it('should apply size class for sm', () => {
      host.size.set('sm');
      openDrawer();
      expect(getDrawerEl().classList.contains('ct-drawer--sm')).toBe(true);
    });

    it('should apply size class for lg', () => {
      host.size.set('lg');
      openDrawer();
      expect(getDrawerEl().classList.contains('ct-drawer--lg')).toBe(true);
    });

    it('should not apply size class for default md', () => {
      openDrawer();
      expect(getDrawerEl().classList.contains('ct-drawer--md')).toBe(false);
    });
  });

  describe('ARIA', () => {
    it('should have role="dialog"', () => {
      expect(getDrawerEl().getAttribute('role')).toBe('dialog');
    });

    it('should set aria-modal="true" when open', () => {
      openDrawer();
      expect(getDrawerEl().getAttribute('aria-modal')).toBe('true');
    });

    it('should not set aria-modal when closed', () => {
      expect(getDrawerEl().getAttribute('aria-modal')).toBeNull();
    });

    it('should set aria-label when provided', () => {
      openDrawer();
      expect(getDrawerEl().getAttribute('aria-label')).toBe('Test drawer');
    });

    it('should fall back to aria-labelledby when no ariaLabel provided', () => {
      host.ariaLabel.set('');
      openDrawer();
      const el = getDrawerEl();
      expect(el.getAttribute('aria-label')).toBeNull();
      expect(el.getAttribute('aria-labelledby')).toBeTruthy();
    });
  });

  describe('close button', () => {
    it('should render close button by default', () => {
      openDrawer();
      const btn = getPanelEl().querySelector('button[aria-label="Close drawer"]');
      expect(btn).toBeTruthy();
    });

    it('should hide close button when showCloseButton is false', () => {
      host.showCloseButton.set(false);
      openDrawer();
      const btn = getPanelEl().querySelector('button[aria-label="Close drawer"]');
      expect(btn).toBeNull();
    });

    it('should close on close button click', () => {
      openDrawer();
      const btn = getPanelEl().querySelector<HTMLButtonElement>(
        'button[aria-label="Close drawer"]'
      )!;
      btn.click();
      fixture.detectChanges();
      expect(host.open()).toBe(false);
      expect(host.closedCount()).toBe(1);
    });
  });

  describe('escape key', () => {
    it('should close on Escape key', () => {
      openDrawer();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      fixture.detectChanges();
      expect(host.open()).toBe(false);
      expect(host.closedCount()).toBe(1);
    });

    it('should not close when already closed', () => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      fixture.detectChanges();
      expect(host.closedCount()).toBe(0);
    });
  });

  describe('backdrop click', () => {
    it('should close on backdrop click', () => {
      openDrawer();
      getDrawerEl().click();
      fixture.detectChanges();
      expect(host.open()).toBe(false);
    });

    it('should not close when clicking inside the panel', () => {
      openDrawer();
      getPanelEl().click();
      fixture.detectChanges();
      expect(host.open()).toBe(true);
    });

    it('should not close on backdrop click when closeOnBackdropClick is false', () => {
      host.closeOnBackdropClick.set(false);
      openDrawer();
      getDrawerEl().click();
      fixture.detectChanges();
      expect(host.open()).toBe(true);
    });
  });

  describe('body scroll locking', () => {
    it('should lock body scroll when opened', () => {
      openDrawer();
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should unlock body scroll when closed', () => {
      openDrawer();
      host.open.set(false);
      fixture.detectChanges();
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('focus management', () => {
    it('should move focus into the drawer when opened', async () => {
      openDrawer();
      await new Promise<void>((r) => queueMicrotask(r));
      const active = document.activeElement;
      const panel = getPanelEl();
      expect(panel.contains(active)).toBe(true);
    });

    it('should restore focus to the previously focused element on close', async () => {
      const trigger = fixture.nativeElement.querySelector(
        'button'
      ) as HTMLButtonElement;
      trigger.focus();
      openDrawer();
      await new Promise<void>((r) => queueMicrotask(r));

      host.open.set(false);
      fixture.detectChanges();
      expect(document.activeElement).toBe(trigger);
    });

    it('should trap focus with Tab key', async () => {
      openDrawer();
      await new Promise<void>((r) => queueMicrotask(r));

      const focusable = getPanelEl().querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled])'
      );
      const last = focusable[focusable.length - 1];
      last.focus();

      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
      );
      fixture.detectChanges();

      expect(document.activeElement).toBe(focusable[0]);
    });

    it('should trap focus with Shift+Tab key', async () => {
      openDrawer();
      await new Promise<void>((r) => queueMicrotask(r));

      const focusable = getPanelEl().querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled])'
      );
      const first = focusable[0];
      first.focus();

      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Tab',
          shiftKey: true,
          bubbles: true,
        })
      );
      fixture.detectChanges();

      expect(document.activeElement).toBe(focusable[focusable.length - 1]);
    });
  });

  describe('two-way binding', () => {
    it('should support [(open)] two-way binding', () => {
      openDrawer();
      expect(getDrawerEl().getAttribute('data-state')).toBe('open');

      host.open.set(false);
      fixture.detectChanges();
      expect(getDrawerEl().getAttribute('data-state')).toBe('closed');
    });
  });

  describe('content projection', () => {
    it('should project header content', () => {
      openDrawer();
      const header = getPanelEl().querySelector('.ct-drawer__header h2');
      expect(header?.textContent).toBe('Test Drawer');
    });

    it('should project body content', () => {
      openDrawer();
      const input = getPanelEl().querySelector('#first-input');
      expect(input).toBeTruthy();
    });

    it('should project footer content', () => {
      openDrawer();
      const btn = getPanelEl().querySelector('#cancel-btn');
      expect(btn).toBeTruthy();
    });
  });
});

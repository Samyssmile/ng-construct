import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import {
  AfPopoverComponent,
  AfPopoverTriggerDirective,
  AfPopoverPosition,
  AfPopoverAlign,
  AfPopoverSize,
} from './popover.component';

@Component({
  imports: [AfPopoverComponent, AfPopoverTriggerDirective],
  template: `
    <af-popover
      [(open)]="open"
      [position]="position()"
      [align]="align()"
      [size]="size()"
      [title]="title()"
      [ariaLabel]="ariaLabel()"
      [showArrow]="showArrow()"
      [closeOnClickOutside]="closeOnClickOutside()"
      (closed)="closedCount.set(closedCount() + 1)">
      <button afPopoverTrigger id="trigger-btn">Toggle</button>
      <div body>
        <input id="first-input" type="text" />
        <button id="inner-btn">Action</button>
      </div>
    </af-popover>
  `,
})
class TestHostComponent {
  open = signal(false);
  position = signal<AfPopoverPosition>('bottom');
  align = signal<AfPopoverAlign>('center');
  size = signal<AfPopoverSize>('md');
  title = signal('');
  ariaLabel = signal('');
  showArrow = signal(true);
  closeOnClickOutside = signal(true);
  closedCount = signal(0);
}

describe('AfPopoverComponent', () => {
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

  function getWrapperEl(): HTMLElement {
    return fixture.nativeElement.querySelector('.ct-popover');
  }

  function getContentEl(): HTMLElement {
    return fixture.nativeElement.querySelector('.ct-popover__content');
  }

  function getTriggerEl(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('#trigger-btn');
  }

  function openPopover(): void {
    host.open.set(true);
    fixture.detectChanges();
  }

  describe('rendering', () => {
    it('should render with data-state="closed" by default', () => {
      expect(getWrapperEl().getAttribute('data-state')).toBe('closed');
    });

    it('should set data-state="open" when open', () => {
      openPopover();
      expect(getWrapperEl().getAttribute('data-state')).toBe('open');
    });

    it('should set data-side to position input', () => {
      expect(getWrapperEl().getAttribute('data-side')).toBe('bottom');
    });

    it('should update data-side when position changes', () => {
      host.position.set('top');
      fixture.detectChanges();
      expect(getWrapperEl().getAttribute('data-side')).toBe('top');
    });

    it('should set data-align to align input', () => {
      expect(getWrapperEl().getAttribute('data-align')).toBe('center');
    });

    it('should apply size class for sm', () => {
      host.size.set('sm');
      fixture.detectChanges();
      expect(getWrapperEl().classList.contains('ct-popover--sm')).toBe(true);
    });

    it('should apply size class for lg', () => {
      host.size.set('lg');
      fixture.detectChanges();
      expect(getWrapperEl().classList.contains('ct-popover--lg')).toBe(true);
    });

    it('should not apply size class for default md', () => {
      expect(getWrapperEl().classList.contains('ct-popover--md')).toBe(false);
    });

    it('should show arrow by default', () => {
      expect(getContentEl().querySelector('.ct-popover__arrow')).toBeTruthy();
    });

    it('should hide arrow when showArrow is false', () => {
      host.showArrow.set(false);
      fixture.detectChanges();
      expect(getContentEl().querySelector('.ct-popover__arrow')).toBeNull();
    });

    it('should show header when title is set', () => {
      host.title.set('Test Title');
      fixture.detectChanges();
      const header = getContentEl().querySelector('.ct-popover__header h3');
      expect(header?.textContent).toBe('Test Title');
    });

    it('should not show header when title is empty', () => {
      expect(getContentEl().querySelector('.ct-popover__header')).toBeNull();
    });
  });

  describe('trigger ARIA', () => {
    it('should set aria-haspopup on trigger', () => {
      expect(getTriggerEl().getAttribute('aria-haspopup')).toBe('dialog');
    });

    it('should set aria-expanded to false when closed', () => {
      expect(getTriggerEl().getAttribute('aria-expanded')).toBe('false');
    });

    it('should set aria-expanded to true when open', () => {
      openPopover();
      expect(getTriggerEl().getAttribute('aria-expanded')).toBe('true');
    });

    it('should set aria-controls to popover content id', () => {
      const contentId = getContentEl().id;
      expect(getTriggerEl().getAttribute('aria-controls')).toBe(contentId);
    });
  });

  describe('popover content ARIA', () => {
    it('should have role="dialog" on content', () => {
      expect(getContentEl().getAttribute('role')).toBe('dialog');
    });

    it('should set aria-label when provided', () => {
      host.ariaLabel.set('Help popup');
      fixture.detectChanges();
      expect(getContentEl().getAttribute('aria-label')).toBe('Help popup');
    });

    it('should set aria-labelledby when title is set and no ariaLabel', () => {
      host.title.set('Info');
      fixture.detectChanges();
      const headerId = getContentEl().querySelector(
        '.ct-popover__header h3'
      )?.id;
      expect(getContentEl().getAttribute('aria-labelledby')).toBe(headerId);
    });

    it('should prefer aria-label over aria-labelledby', () => {
      host.ariaLabel.set('Custom label');
      host.title.set('Title');
      fixture.detectChanges();
      expect(getContentEl().getAttribute('aria-label')).toBe('Custom label');
      expect(getContentEl().getAttribute('aria-labelledby')).toBeNull();
    });
  });

  describe('toggle via trigger', () => {
    it('should open on trigger click', () => {
      getTriggerEl().click();
      fixture.detectChanges();
      expect(host.open()).toBe(true);
      expect(getWrapperEl().getAttribute('data-state')).toBe('open');
    });

    it('should close on second trigger click', () => {
      openPopover();
      getTriggerEl().click();
      fixture.detectChanges();
      expect(host.open()).toBe(false);
      expect(host.closedCount()).toBe(1);
    });
  });

  describe('escape key', () => {
    it('should close on Escape', () => {
      openPopover();
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

    it('should return focus to trigger on Escape', async () => {
      getTriggerEl().focus();
      openPopover();
      await new Promise<void>((r) => queueMicrotask(r));

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      fixture.detectChanges();

      expect(document.activeElement).toBe(getTriggerEl());
    });
  });

  describe('click outside', () => {
    it('should close on click outside', () => {
      openPopover();
      document.body.click();
      fixture.detectChanges();
      expect(host.open()).toBe(false);
      expect(host.closedCount()).toBe(1);
    });

    it('should not close on click inside content', () => {
      openPopover();
      getContentEl().click();
      fixture.detectChanges();
      expect(host.open()).toBe(true);
    });

    it('should not close on click on trigger', () => {
      openPopover();
      // Trigger click toggles, but clicking trigger when open closes via toggle,
      // not via click-outside. We verify click-outside doesn't double-fire.
      const wrapper = getWrapperEl();
      wrapper.click();
      fixture.detectChanges();
      // Clicking the wrapper itself is inside the wrapper, so click-outside doesn't fire.
      expect(host.open()).toBe(true);
    });

    it('should not close when closeOnClickOutside is false', () => {
      host.closeOnClickOutside.set(false);
      openPopover();
      document.body.click();
      fixture.detectChanges();
      expect(host.open()).toBe(true);
    });
  });

  describe('focus management', () => {
    it('should move focus into popover when opened', async () => {
      openPopover();
      await new Promise<void>((r) => queueMicrotask(r));
      const content = getContentEl();
      expect(content.contains(document.activeElement)).toBe(true);
    });

    it('should restore focus on close', async () => {
      getTriggerEl().focus();
      openPopover();
      await new Promise<void>((r) => queueMicrotask(r));

      host.open.set(false);
      fixture.detectChanges();
      expect(document.activeElement).toBe(getTriggerEl());
    });

    it('should trap focus with Tab', async () => {
      openPopover();
      await new Promise<void>((r) => queueMicrotask(r));

      const focusable = getContentEl().querySelectorAll<HTMLElement>(
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

    it('should trap focus with Shift+Tab', async () => {
      openPopover();
      await new Promise<void>((r) => queueMicrotask(r));

      const focusable = getContentEl().querySelectorAll<HTMLElement>(
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
      openPopover();
      expect(getWrapperEl().getAttribute('data-state')).toBe('open');

      host.open.set(false);
      fixture.detectChanges();
      expect(getWrapperEl().getAttribute('data-state')).toBe('closed');
    });
  });

  describe('content projection', () => {
    it('should project trigger', () => {
      expect(getTriggerEl()).toBeTruthy();
      expect(getTriggerEl().textContent?.trim()).toBe('Toggle');
    });

    it('should project body content', () => {
      const input = getContentEl().querySelector('#first-input');
      expect(input).toBeTruthy();
    });

    it('should project inner buttons', () => {
      const btn = getContentEl().querySelector('#inner-btn');
      expect(btn).toBeTruthy();
    });
  });
});

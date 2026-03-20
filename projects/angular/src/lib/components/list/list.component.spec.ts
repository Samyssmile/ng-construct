import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  AfListComponent,
  AfListItemComponent,
  AfListVariant,
  AfListSize,
} from './list.component';

// ---------------------------------------------------------------------------
// Test host components
// ---------------------------------------------------------------------------

@Component({
  imports: [AfListComponent, AfListItemComponent],
  template: `
    <af-list
      [variant]="variant()"
      [size]="size()"
      [dense]="dense()"
      [ordered]="ordered()"
      [ariaLabel]="ariaLabel()">
      <af-list-item [active]="true" [selected]="true">
        <svg leading></svg>
        <span class="ct-list__item-title">Item 1</span>
        <span trailing class="ct-badge">Badge</span>
      </af-list-item>
      <af-list-item>
        <span class="ct-list__item-title">Item 2</span>
      </af-list-item>
      <af-list-item [disabled]="true">
        <span class="ct-list__item-title">Item 3 (disabled)</span>
      </af-list-item>
    </af-list>
  `,
})
class TestHostComponent {
  variant = signal<AfListVariant>('default');
  size = signal<AfListSize>('md');
  dense = signal(false);
  ordered = signal(false);
  ariaLabel = signal('Test list');
}

@Component({
  imports: [AfListComponent, AfListItemComponent],
  template: `
    <af-list>
      <af-list-item [interactive]="true" (clicked)="onClicked($event)">
        <span class="ct-list__item-title">Click me</span>
      </af-list-item>
      <af-list-item [disabled]="true" (clicked)="onDisabledClicked($event)">
        <span class="ct-list__item-title">Disabled</span>
      </af-list-item>
    </af-list>
  `,
})
class InteractiveHostComponent {
  onClicked = vi.fn();
  onDisabledClicked = vi.fn();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function queryAll<T extends Element>(
  fixture: ComponentFixture<unknown>,
  selector: string,
): T[] {
  return Array.from(fixture.nativeElement.querySelectorAll(selector));
}

function listItems(fixture: ComponentFixture<unknown>): HTMLElement[] {
  return queryAll(fixture, '.ct-list__item');
}

function pressKey(element: HTMLElement, key: string): void {
  element.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true }),
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AfListComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    host = fixture.componentInstance;
  });

  // ── Rendering ──────────────────────────────────────────────────────────

  it('should render with ct-list class on ul element', () => {
    const list = fixture.nativeElement.querySelector('.ct-list');
    expect(list).toBeTruthy();
    expect(list.tagName).toBe('UL');
  });

  it('should render all list items', () => {
    expect(listItems(fixture)).toHaveLength(3);
  });

  it('should render as ol when ordered', () => {
    host.ordered.set(true);
    fixture.detectChanges();

    const list = fixture.nativeElement.querySelector('.ct-list');
    expect(list.tagName).toBe('OL');
  });

  // ── Variants ────────────────────────────────────────────────────────────

  it('should not add variant class for default', () => {
    const list = fixture.nativeElement.querySelector('.ct-list');
    expect(list.classList.contains('ct-list--default')).toBe(false);
    expect(list.classList.contains('ct-list--bordered')).toBe(false);
    expect(list.classList.contains('ct-list--selectable')).toBe(false);
  });

  it('should apply bordered variant class', () => {
    host.variant.set('bordered');
    fixture.detectChanges();

    const list = fixture.nativeElement.querySelector('.ct-list');
    expect(list.classList.contains('ct-list--bordered')).toBe(true);
  });

  it('should apply selectable class for interactive variant', () => {
    host.variant.set('interactive');
    fixture.detectChanges();

    const list = fixture.nativeElement.querySelector('.ct-list');
    expect(list.classList.contains('ct-list--selectable')).toBe(true);
  });

  // ── Size & Dense ────────────────────────────────────────────────────────

  it('should not add size class for default md', () => {
    const list = fixture.nativeElement.querySelector('.ct-list');
    expect(list.classList.contains('ct-list--md')).toBe(false);
  });

  it('should apply sm size class', () => {
    host.size.set('sm');
    fixture.detectChanges();

    const list = fixture.nativeElement.querySelector('.ct-list');
    expect(list.classList.contains('ct-list--sm')).toBe(true);
  });

  it('should apply lg size class', () => {
    host.size.set('lg');
    fixture.detectChanges();

    const list = fixture.nativeElement.querySelector('.ct-list');
    expect(list.classList.contains('ct-list--lg')).toBe(true);
  });

  it('should apply dense class', () => {
    host.dense.set(true);
    fixture.detectChanges();

    const list = fixture.nativeElement.querySelector('.ct-list');
    expect(list.classList.contains('ct-list--dense')).toBe(true);
  });

  // ── ARIA ────────────────────────────────────────────────────────────────

  it('should set aria-label on list', () => {
    const list = fixture.nativeElement.querySelector('.ct-list');
    expect(list.getAttribute('aria-label')).toBe('Test list');
  });

  it('should set role=listbox on interactive variant', () => {
    host.variant.set('interactive');
    fixture.detectChanges();

    const list = fixture.nativeElement.querySelector('.ct-list');
    expect(list.getAttribute('role')).toBe('listbox');
  });

  it('should not set explicit role on default variant', () => {
    const list = fixture.nativeElement.querySelector('.ct-list');
    expect(list.getAttribute('role')).toBeNull();
  });

  it('should set role=option on items in interactive variant', () => {
    host.variant.set('interactive');
    fixture.detectChanges();

    const items = listItems(fixture);
    items.forEach((item) => {
      expect(item.getAttribute('role')).toBe('option');
    });
  });

  it('should set aria-selected on interactive items', () => {
    host.variant.set('interactive');
    fixture.detectChanges();

    const items = listItems(fixture);
    expect(items[0].getAttribute('aria-selected')).toBe('true');
    expect(items[1].getAttribute('aria-selected')).toBe('false');
  });

  it('should not set aria-selected on non-interactive items', () => {
    const items = listItems(fixture);
    expect(items[0].getAttribute('aria-selected')).toBeNull();
  });

  it('should set aria-disabled on disabled items', () => {
    const items = listItems(fixture);
    expect(items[2].getAttribute('aria-disabled')).toBe('true');
    expect(items[0].getAttribute('aria-disabled')).toBeNull();
  });

  // ── Item CSS Classes ────────────────────────────────────────────────────

  it('should add ct-list__item--active class on active items', () => {
    const items = listItems(fixture);
    expect(items[0].classList.contains('ct-list__item--active')).toBe(true);
    expect(items[1].classList.contains('ct-list__item--active')).toBe(false);
  });

  it('should add ct-list__item--interactive on items in interactive variant', () => {
    host.variant.set('interactive');
    fixture.detectChanges();

    const items = listItems(fixture);
    items.forEach((item) => {
      expect(item.classList.contains('ct-list__item--interactive')).toBe(true);
    });
  });

  // ── Content Projection ──────────────────────────────────────────────────

  it('should project leading content', () => {
    const leading = fixture.nativeElement.querySelector(
      '.ct-list__item-leading',
    );
    expect(leading).toBeTruthy();
    expect(leading.querySelector('svg')).toBeTruthy();
  });

  it('should set aria-hidden on leading content wrapper', () => {
    const leading = fixture.nativeElement.querySelector(
      '.ct-list__item-leading',
    );
    expect(leading.getAttribute('aria-hidden')).toBe('true');
  });

  it('should project trailing content', () => {
    const trailing = fixture.nativeElement.querySelector(
      '.ct-list__item-trailing',
    );
    expect(trailing).toBeTruthy();
    expect(trailing.querySelector('.ct-badge')).toBeTruthy();
  });

  it('should project default content into content area', () => {
    const content = fixture.nativeElement.querySelector(
      '.ct-list__item-content',
    );
    expect(content).toBeTruthy();
    expect(content.querySelector('.ct-list__item-title')).toBeTruthy();
  });

  it('should hide leading wrapper when no leading content', () => {
    const hostItems = fixture.nativeElement.querySelectorAll('af-list-item');
    const secondItem = hostItems[1];
    const leading = secondItem.querySelector('.ct-list__item-leading');
    expect(leading).toBeTruthy();
    expect(leading.children).toHaveLength(0);
  });

  it('should hide trailing wrapper when no trailing content', () => {
    const hostItems = fixture.nativeElement.querySelectorAll('af-list-item');
    const secondItem = hostItems[1];
    const trailing = secondItem.querySelector('.ct-list__item-trailing');
    expect(trailing).toBeTruthy();
    expect(trailing.children).toHaveLength(0);
  });

  // ── Keyboard Navigation (interactive) ──────────────────────────────────

  describe('keyboard navigation', () => {
    beforeEach(() => {
      host.variant.set('interactive');
      fixture.detectChanges();
    });

    it('should move focus down with ArrowDown', () => {
      const items = listItems(fixture);
      items[0].focus();
      pressKey(items[0], 'ArrowDown');
      fixture.detectChanges();

      expect(document.activeElement).toBe(items[1]);
    });

    it('should move focus up with ArrowUp', () => {
      const items = listItems(fixture);
      items[1].focus();
      pressKey(items[1], 'ArrowUp');
      fixture.detectChanges();

      expect(document.activeElement).toBe(items[0]);
    });

    it('should wrap focus from last enabled to first with ArrowDown', () => {
      const items = listItems(fixture);
      items[1].focus();
      pressKey(items[1], 'ArrowDown');
      fixture.detectChanges();

      // Item 2 is disabled, wraps to item 0
      expect(document.activeElement).toBe(items[0]);
    });

    it('should wrap focus from first to last enabled with ArrowUp', () => {
      const items = listItems(fixture);
      items[0].focus();
      pressKey(items[0], 'ArrowUp');
      fixture.detectChanges();

      expect(document.activeElement).toBe(items[1]);
    });

    it('should jump to first item with Home', () => {
      const items = listItems(fixture);
      items[1].focus();
      pressKey(items[1], 'Home');
      fixture.detectChanges();

      expect(document.activeElement).toBe(items[0]);
    });

    it('should jump to last enabled item with End', () => {
      const items = listItems(fixture);
      items[0].focus();
      pressKey(items[0], 'End');
      fixture.detectChanges();

      expect(document.activeElement).toBe(items[1]);
    });

    it('should skip disabled items during navigation', () => {
      const items = listItems(fixture);
      items[1].focus();
      pressKey(items[1], 'ArrowDown');
      fixture.detectChanges();

      // Disabled item 2 is skipped, wraps to item 0
      expect(document.activeElement).toBe(items[0]);
    });
  });

  // ── Roving Tabindex ─────────────────────────────────────────────────────

  describe('roving tabindex', () => {
    beforeEach(() => {
      host.variant.set('interactive');
      fixture.detectChanges();
    });

    it('should set tabindex=0 on first enabled item', () => {
      const items = listItems(fixture);
      expect(items[0].getAttribute('tabindex')).toBe('0');
    });

    it('should set tabindex=-1 on non-focused enabled items', () => {
      const items = listItems(fixture);
      expect(items[1].getAttribute('tabindex')).toBe('-1');
    });

    it('should set tabindex=-1 on disabled items', () => {
      const items = listItems(fixture);
      expect(items[2].getAttribute('tabindex')).toBe('-1');
    });

    it('should update tabindex after keyboard navigation', () => {
      const items = listItems(fixture);
      items[0].focus();
      pressKey(items[0], 'ArrowDown');
      fixture.detectChanges();

      expect(items[0].getAttribute('tabindex')).toBe('-1');
      expect(items[1].getAttribute('tabindex')).toBe('0');
    });
  });
});

describe('AfListItem interactive behavior', () => {
  let fixture: ComponentFixture<InteractiveHostComponent>;
  let host: InteractiveHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InteractiveHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InteractiveHostComponent);
    fixture.detectChanges();
    host = fixture.componentInstance;
  });

  it('should emit clicked on click', () => {
    const items = listItems(fixture);
    items[0].click();
    fixture.detectChanges();

    expect(host.onClicked).toHaveBeenCalled();
  });

  it('should not emit clicked when disabled', () => {
    const items = listItems(fixture);
    items[1].click();
    fixture.detectChanges();

    expect(host.onDisabledClicked).not.toHaveBeenCalled();
  });

  it('should add ct-list__item--interactive class on interactive items', () => {
    const items = listItems(fixture);
    expect(items[0].classList.contains('ct-list__item--interactive')).toBe(
      true,
    );
    expect(items[1].classList.contains('ct-list__item--interactive')).toBe(
      false,
    );
  });

  it('should set tabindex=0 on interactive items in default list', () => {
    const items = listItems(fixture);
    expect(items[0].getAttribute('tabindex')).toBe('0');
  });

  it('should emit clicked on Enter key', () => {
    const items = listItems(fixture);
    items[0].focus();
    pressKey(items[0], 'Enter');
    fixture.detectChanges();

    expect(host.onClicked).toHaveBeenCalled();
  });

  it('should emit clicked on Space key', () => {
    const items = listItems(fixture);
    items[0].focus();
    pressKey(items[0], ' ');
    fixture.detectChanges();

    expect(host.onClicked).toHaveBeenCalled();
  });
});

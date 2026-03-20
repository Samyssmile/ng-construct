import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  AfNavbarComponent,
  AfNavItemComponent,
  AfNavbarSize,
  AfNavbarVariant,
} from './navbar.component';

// ---------------------------------------------------------------------------
// Test host components
// ---------------------------------------------------------------------------

@Component({
  imports: [AfNavbarComponent, AfNavItemComponent],
  template: `
    <af-navbar
      [size]="size()"
      [variant]="variant()"
      [center]="center()"
      [ariaLabel]="ariaLabel()">
      <a brand class="ct-navbar__brand" href="/">Test Brand</a>
      <af-nav-item label="Home" href="/" [active]="true" />
      <af-nav-item label="About" href="/about" />
      <af-nav-item label="Disabled" href="/disabled" [disabled]="true" />
      <button actions class="ct-button">Action</button>
    </af-navbar>
  `,
})
class TestHostComponent {
  size = signal<AfNavbarSize>('md');
  variant = signal<AfNavbarVariant>('default');
  center = signal(false);
  ariaLabel = signal('Main navigation');
}

@Component({
  imports: [AfNavbarComponent, AfNavItemComponent],
  template: `
    <af-navbar>
      <af-nav-item label="Click Me" (clicked)="onClicked($event)" />
      <af-nav-item label="Link" href="/link" />
    </af-navbar>
  `,
})
class ButtonItemHostComponent {
  onClicked = vi.fn();
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

function desktopLinks(fixture: ComponentFixture<unknown>): HTMLElement[] {
  return queryAll(fixture, '[role="menubar"] [role="menuitem"]');
}

function mobileLinkEls(fixture: ComponentFixture<unknown>): HTMLElement[] {
  return queryAll(fixture, '.ct-navbar__mobile-menu [role="menuitem"]');
}

function toggleButton(
  fixture: ComponentFixture<unknown>,
): HTMLButtonElement {
  return fixture.nativeElement.querySelector('.ct-navbar__toggle');
}

function pressKey(element: HTMLElement, key: string): void {
  element.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true }),
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AfNavbarComponent', () => {
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

  it('should render with ct-navbar class on header element', () => {
    const header = fixture.nativeElement.querySelector('.ct-navbar');
    expect(header).toBeTruthy();
    expect(header.tagName).toBe('HEADER');
  });

  it('should render all nav items in desktop menubar', () => {
    expect(desktopLinks(fixture)).toHaveLength(3);
  });

  it('should render brand content', () => {
    const brand = fixture.nativeElement.querySelector('.ct-navbar__brand');
    expect(brand).toBeTruthy();
    expect(brand.textContent.trim()).toBe('Test Brand');
  });

  it('should render actions content', () => {
    const action = fixture.nativeElement.querySelector(
      '.ct-navbar__actions .ct-button',
    );
    expect(action).toBeTruthy();
    expect(action.textContent.trim()).toBe('Action');
  });

  it('should render mobile toggle button', () => {
    expect(toggleButton(fixture)).toBeTruthy();
  });

  it('should render mobile menu with matching items', () => {
    expect(mobileLinkEls(fixture)).toHaveLength(3);
  });

  it('should display item labels', () => {
    const links = desktopLinks(fixture);
    expect(links[0].textContent?.trim()).toBe('Home');
    expect(links[1].textContent?.trim()).toBe('About');
    expect(links[2].textContent?.trim()).toBe('Disabled');
  });

  // ── Size & Variant Classes ─────────────────────────────────────────────

  it('should not add size class for default md', () => {
    const header = fixture.nativeElement.querySelector('.ct-navbar');
    expect(header.classList.contains('ct-navbar--md')).toBe(false);
  });

  it('should apply sm size class', () => {
    host.size.set('sm');
    fixture.detectChanges();
    const header = fixture.nativeElement.querySelector('.ct-navbar');
    expect(header.classList.contains('ct-navbar--sm')).toBe(true);
  });

  it('should apply lg size class', () => {
    host.size.set('lg');
    fixture.detectChanges();
    const header = fixture.nativeElement.querySelector('.ct-navbar');
    expect(header.classList.contains('ct-navbar--lg')).toBe(true);
  });

  it('should not add variant class for default', () => {
    const header = fixture.nativeElement.querySelector('.ct-navbar');
    expect(header.classList.contains('ct-navbar--default')).toBe(false);
  });

  it('should apply variant classes', () => {
    const variants: AfNavbarVariant[] = [
      'sticky',
      'fixed',
      'elevated',
      'transparent',
      'dark',
      'bordered',
    ];
    for (const v of variants) {
      host.variant.set(v);
      fixture.detectChanges();
      const header = fixture.nativeElement.querySelector('.ct-navbar');
      expect(header.classList.contains(`ct-navbar--${v}`)).toBe(true);
    }
  });

  it('should apply center class', () => {
    host.center.set(true);
    fixture.detectChanges();
    const header = fixture.nativeElement.querySelector('.ct-navbar');
    expect(header.classList.contains('ct-navbar--center')).toBe(true);
  });

  // ── ARIA & Accessibility ───────────────────────────────────────────────

  it('should set role="menubar" on the nav list', () => {
    const menubar = fixture.nativeElement.querySelector('[role="menubar"]');
    expect(menubar).toBeTruthy();
    expect(menubar.tagName).toBe('UL');
  });

  it('should set role="menuitem" on nav links', () => {
    const items = desktopLinks(fixture);
    items.forEach((item) => {
      expect(item.getAttribute('role')).toBe('menuitem');
    });
  });

  it('should set role="none" on li wrapper elements', () => {
    const lis = queryAll(fixture, '.ct-navbar__item');
    lis.forEach((li) => {
      expect(li.getAttribute('role')).toBe('none');
    });
  });

  it('should set aria-current="page" on active item', () => {
    const links = desktopLinks(fixture);
    expect(links[0].getAttribute('aria-current')).toBe('page');
    expect(links[1].getAttribute('aria-current')).toBeNull();
  });

  it('should set aria-disabled on disabled item', () => {
    const links = desktopLinks(fixture);
    expect(links[2].getAttribute('aria-disabled')).toBe('true');
    expect(links[0].getAttribute('aria-disabled')).toBeNull();
  });

  it('should set aria-label on nav element', () => {
    const nav = fixture.nativeElement.querySelector('nav');
    expect(nav.getAttribute('aria-label')).toBe('Main navigation');
  });

  it('should update aria-label when input changes', () => {
    host.ariaLabel.set('Site navigation');
    fixture.detectChanges();
    const nav = fixture.nativeElement.querySelector('nav');
    expect(nav.getAttribute('aria-label')).toBe('Site navigation');
  });

  it('should set aria-expanded="false" on toggle by default', () => {
    const toggle = toggleButton(fixture);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('should link toggle to mobile menu via aria-controls', () => {
    const toggle = toggleButton(fixture);
    const mobileMenu = fixture.nativeElement.querySelector(
      '.ct-navbar__mobile-menu',
    );
    expect(toggle.getAttribute('aria-controls')).toBe(mobileMenu.id);
  });

  it('should render nav links as <a> elements when href is provided', () => {
    const links = desktopLinks(fixture);
    expect(links[0].tagName).toBe('A');
    expect(links[0].getAttribute('href')).toBe('/');
  });

  it('should set role="menu" on mobile menu', () => {
    const mobileMenu = fixture.nativeElement.querySelector(
      '.ct-navbar__mobile-menu',
    );
    expect(mobileMenu.getAttribute('role')).toBe('menu');
  });

  it('should set aria-label on mobile menu', () => {
    const mobileMenu = fixture.nativeElement.querySelector(
      '.ct-navbar__mobile-menu',
    );
    expect(mobileMenu.getAttribute('aria-label')).toBe('Mobile navigation');
  });

  // ── Roving Tabindex ────────────────────────────────────────────────────

  it('should set tabindex=0 on first enabled item', () => {
    const links = desktopLinks(fixture);
    expect(links[0].getAttribute('tabindex')).toBe('0');
  });

  it('should set tabindex=-1 on non-focused enabled items', () => {
    const links = desktopLinks(fixture);
    expect(links[1].getAttribute('tabindex')).toBe('-1');
  });

  it('should set tabindex=-1 on disabled items', () => {
    const links = desktopLinks(fixture);
    expect(links[2].getAttribute('tabindex')).toBe('-1');
  });

  // ── Desktop Keyboard Navigation ────────────────────────────────────────

  it('should move focus right with ArrowRight', () => {
    const links = desktopLinks(fixture);
    links[0].focus();
    pressKey(links[0], 'ArrowRight');
    fixture.detectChanges();

    expect(document.activeElement).toBe(links[1]);
  });

  it('should move focus left with ArrowLeft', () => {
    const links = desktopLinks(fixture);
    links[0].focus();
    pressKey(links[0], 'ArrowRight');
    fixture.detectChanges();

    pressKey(links[1], 'ArrowLeft');
    fixture.detectChanges();

    expect(document.activeElement).toBe(links[0]);
  });

  it('should wrap from last enabled to first with ArrowRight', () => {
    const links = desktopLinks(fixture);
    links[0].focus();
    pressKey(links[0], 'ArrowRight');
    fixture.detectChanges();
    pressKey(links[1], 'ArrowRight');
    fixture.detectChanges();

    // Disabled is skipped, wraps to Home
    expect(document.activeElement).toBe(links[0]);
  });

  it('should wrap from first to last enabled with ArrowLeft', () => {
    const links = desktopLinks(fixture);
    links[0].focus();
    pressKey(links[0], 'ArrowLeft');
    fixture.detectChanges();

    // Wraps to last enabled item (About)
    expect(document.activeElement).toBe(links[1]);
  });

  it('should move to first item with Home', () => {
    const links = desktopLinks(fixture);
    links[0].focus();
    pressKey(links[0], 'ArrowRight');
    fixture.detectChanges();

    pressKey(links[1], 'Home');
    fixture.detectChanges();

    expect(document.activeElement).toBe(links[0]);
  });

  it('should move to last enabled item with End', () => {
    const links = desktopLinks(fixture);
    links[0].focus();
    pressKey(links[0], 'End');
    fixture.detectChanges();

    // Last enabled item is About (Disabled is skipped)
    expect(document.activeElement).toBe(links[1]);
  });

  it('should skip disabled items during keyboard navigation', () => {
    const links = desktopLinks(fixture);
    links[0].focus();
    // Right to About, Right again wraps to Home (skips Disabled)
    pressKey(links[0], 'ArrowRight');
    fixture.detectChanges();
    pressKey(links[1], 'ArrowRight');
    fixture.detectChanges();

    expect(document.activeElement).toBe(links[0]);
  });

  it('should update roving tabindex after keyboard navigation', () => {
    const links = desktopLinks(fixture);
    links[0].focus();
    pressKey(links[0], 'ArrowRight');
    fixture.detectChanges();

    expect(links[0].getAttribute('tabindex')).toBe('-1');
    expect(links[1].getAttribute('tabindex')).toBe('0');
  });

  // ── Mobile Menu ────────────────────────────────────────────────────────

  it('should open mobile menu on toggle click', () => {
    const toggle = toggleButton(fixture);
    toggle.click();
    fixture.detectChanges();

    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    const mobileMenu = fixture.nativeElement.querySelector(
      '.ct-navbar__mobile-menu',
    );
    expect(mobileMenu.getAttribute('data-state')).toBe('open');
  });

  it('should close mobile menu on second toggle click', () => {
    const toggle = toggleButton(fixture);
    toggle.click();
    fixture.detectChanges();
    toggle.click();
    fixture.detectChanges();

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    const mobileMenu = fixture.nativeElement.querySelector(
      '.ct-navbar__mobile-menu',
    );
    expect(mobileMenu.getAttribute('data-state')).toBe('closed');
  });

  it('should update toggle aria-label based on state', () => {
    const toggle = toggleButton(fixture);
    expect(toggle.getAttribute('aria-label')).toBe('Open menu');

    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-label')).toBe('Close menu');
  });

  it('should set tabindex=-1 on mobile links when closed', () => {
    const links = mobileLinkEls(fixture);
    links.forEach((link) => {
      expect(link.getAttribute('tabindex')).toBe('-1');
    });
  });

  it('should set tabindex=0 on mobile links when open', () => {
    toggleButton(fixture).click();
    fixture.detectChanges();

    const links = mobileLinkEls(fixture);
    links.forEach((link) => {
      expect(link.getAttribute('tabindex')).toBe('0');
    });
  });

  it('should close mobile menu on Escape and focus toggle', () => {
    const toggle = toggleButton(fixture);
    toggle.click();
    fixture.detectChanges();

    const links = mobileLinkEls(fixture);
    links[0].focus();
    pressKey(links[0], 'Escape');
    fixture.detectChanges();

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(toggle);
  });

  it('should navigate mobile menu with ArrowDown', () => {
    toggleButton(fixture).click();
    fixture.detectChanges();

    const links = mobileLinkEls(fixture);
    links[0].focus();
    pressKey(links[0], 'ArrowDown');
    fixture.detectChanges();

    expect(document.activeElement).toBe(links[1]);
  });

  it('should navigate mobile menu with ArrowUp', () => {
    toggleButton(fixture).click();
    fixture.detectChanges();

    const links = mobileLinkEls(fixture);
    links[1].focus();
    pressKey(links[1], 'ArrowUp');
    fixture.detectChanges();

    expect(document.activeElement).toBe(links[0]);
  });

  it('should navigate to first mobile item with Home', () => {
    toggleButton(fixture).click();
    fixture.detectChanges();

    const links = mobileLinkEls(fixture);
    links[1].focus();
    pressKey(links[1], 'Home');
    fixture.detectChanges();

    expect(document.activeElement).toBe(links[0]);
  });

  it('should navigate to last enabled mobile item with End', () => {
    toggleButton(fixture).click();
    fixture.detectChanges();

    const links = mobileLinkEls(fixture);
    links[0].focus();
    pressKey(links[0], 'End');
    fixture.detectChanges();

    // Last enabled is About (index 1), Disabled is skipped
    expect(document.activeElement).toBe(links[1]);
  });

  it('should skip disabled items in mobile menu navigation', () => {
    toggleButton(fixture).click();
    fixture.detectChanges();

    const links = mobileLinkEls(fixture);
    links[1].focus();
    // ArrowDown from About wraps to Home (skips Disabled)
    pressKey(links[1], 'ArrowDown');
    fixture.detectChanges();

    expect(document.activeElement).toBe(links[0]);
  });

  it('should mirror active state in mobile menu', () => {
    const links = mobileLinkEls(fixture);
    expect(links[0].getAttribute('aria-current')).toBe('page');
    expect(links[1].getAttribute('aria-current')).toBeNull();
  });

  it('should mirror disabled state in mobile menu', () => {
    const links = mobileLinkEls(fixture);
    expect(links[2].getAttribute('aria-disabled')).toBe('true');
  });

  // ── Disabled Item ──────────────────────────────────────────────────────

  it('should prevent click on disabled nav item', () => {
    const links = desktopLinks(fixture);
    const disabledLink = links[2] as HTMLAnchorElement;
    const clickEvent = new MouseEvent('click', { bubbles: true });
    const preventSpy = vi.spyOn(clickEvent, 'preventDefault');

    disabledLink.dispatchEvent(clickEvent);
    fixture.detectChanges();

    expect(preventSpy).toHaveBeenCalled();
  });
});

describe('AfNavItemComponent button variant', () => {
  let fixture: ComponentFixture<ButtonItemHostComponent>;
  let host: ButtonItemHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonItemHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonItemHostComponent);
    fixture.detectChanges();
    host = fixture.componentInstance;
  });

  it('should render as <button> when no href is provided', () => {
    const links = desktopLinks(fixture);
    expect(links[0].tagName).toBe('BUTTON');
    expect(links[0].getAttribute('type')).toBe('button');
  });

  it('should render as <a> when href is provided', () => {
    const links = desktopLinks(fixture);
    expect(links[1].tagName).toBe('A');
    expect(links[1].getAttribute('href')).toBe('/link');
  });

  it('should emit clicked event on button click', () => {
    const links = desktopLinks(fixture);
    links[0].click();
    fixture.detectChanges();

    expect(host.onClicked).toHaveBeenCalled();
  });
});

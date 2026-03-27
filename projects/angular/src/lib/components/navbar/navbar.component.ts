import {
  Component,
  ChangeDetectionStrategy,
  booleanAttribute,
  input,
  output,
  signal,
  computed,
  contentChildren,
  effect,
  viewChild,
  viewChildren,
  ElementRef,
  inject,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

let nextId = 0;

export type AfNavbarSize = 'sm' | 'md' | 'lg';
export type AfNavbarVariant =
  | 'default'
  | 'sticky'
  | 'fixed'
  | 'elevated'
  | 'transparent'
  | 'dark'
  | 'bordered';

/**
 * Individual navigation item used within af-navbar or af-toolbar.
 *
 * Supports Angular Router via `routerLink`, standard links via `href`,
 * and button mode when neither is provided. Content projection allows
 * icons and custom markup inside the link.
 *
 * @example
 * <af-nav-item label="Dashboard" routerLink="/dashboard">
 *   <af-icon name="dashboard" /> Dashboard
 * </af-nav-item>
 */
@Component({
  selector: 'af-nav-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, NgTemplateOutlet],
  template: `
    <li class="ct-navbar__item" role="none">
      <ng-template #contentTpl>
        <ng-content>{{ label() }}</ng-content>
      </ng-template>

      @if (routerLink()) {
        <a
          #linkEl
          class="ct-navbar__link"
          [routerLink]="routerLink()!"
          routerLinkActive="ct-navbar__link--active"
          role="menuitem"
          [attr.aria-disabled]="disabled() || null"
          [attr.tabindex]="rovingTabindex()"
          (click)="onClick($event)">
          <ng-container [ngTemplateOutlet]="contentTpl" />
        </a>
      } @else if (href()) {
        <a
          #linkEl
          class="ct-navbar__link"
          [class.ct-navbar__link--active]="active()"
          [href]="href()"
          role="menuitem"
          [attr.aria-current]="active() ? 'page' : null"
          [attr.aria-disabled]="disabled() || null"
          [attr.tabindex]="rovingTabindex()"
          (click)="onClick($event)">
          <ng-container [ngTemplateOutlet]="contentTpl" />
        </a>
      } @else {
        <button
          #linkEl
          class="ct-navbar__link"
          [class.ct-navbar__link--active]="active()"
          type="button"
          role="menuitem"
          [attr.aria-current]="active() ? 'page' : null"
          [attr.aria-disabled]="disabled() || null"
          [attr.tabindex]="rovingTabindex()"
          (click)="onClick($event)">
          <ng-container [ngTemplateOutlet]="contentTpl" />
        </button>
      }
    </li>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export class AfNavItemComponent {
  /** Text label shown as fallback when no content is projected. Also used by the mobile menu. */
  label = input.required<string>();

  /** URL for the navigation link. Renders as `<a>` when provided, `<button>` otherwise. */
  href = input('');

  /** Angular Router link. Renders as `<a>` with routerLink and auto-active detection. */
  routerLink = input<string | string[] | null>(null);

  /** Marks this item as the currently active page (used for href/button mode, routerLink auto-detects). */
  active = input(false, { transform: booleanAttribute });

  /** Disables interaction with this item. */
  disabled = input(false, { transform: booleanAttribute });

  /** Emits when the item is clicked (only fires when not disabled). */
  clicked = output<MouseEvent>();

  /** Roving tabindex managed by the parent AfNavbarComponent. */
  rovingTabindex = signal(0);

  linkRef = viewChild<ElementRef<HTMLElement>>('linkEl');

  /** Focus the link or button element. */
  focusLink(): void {
    this.linkRef()?.nativeElement.focus();
  }

  onClick(event: MouseEvent): void {
    if (this.disabled()) {
      event.preventDefault();
      return;
    }
    this.clicked.emit(event);
  }
}

/**
 * Responsive navbar with mobile menu, keyboard navigation, and ARIA landmarks.
 *
 * @example
 * <af-navbar ariaLabel="Main navigation">
 *   <a brand class="ct-navbar__brand" href="/">My App</a>
 *   <af-nav-item label="Dashboard" routerLink="/dashboard">
 *     <af-icon name="dashboard" /> Dashboard
 *   </af-nav-item>
 *   <af-nav-item label="Settings" routerLink="/settings" />
 *   <button actions class="ct-button">Profile</button>
 * </af-navbar>
 */
@Component({
  selector: 'af-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  host: {
    '(keydown)': 'handleKeydown($event)',
    '(document:click)': 'onDocumentClick($event)',
  },
  template: `
    <header [class]="navbarClasses()">
      <div class="ct-navbar__brand-wrapper">
        <ng-content select="[brand]" />
      </div>

      <button
        #toggleBtn
        class="ct-navbar__toggle"
        type="button"
        [attr.aria-expanded]="mobileMenuOpen()"
        [attr.aria-label]="mobileMenuOpen() ? 'Close menu' : 'Open menu'"
        [attr.aria-controls]="mobileMenuId"
        (click)="toggleMobileMenu()">
        <span class="ct-navbar__toggle-icon">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      <nav [attr.aria-label]="ariaLabel()">
        <ul class="ct-navbar__nav" role="menubar">
          <ng-content />
        </ul>
      </nav>

      <div class="ct-navbar__spacer"></div>

      <div class="ct-navbar__actions">
        <ng-content select="[actions]" />
      </div>

      <div
        class="ct-navbar__mobile-menu"
        [attr.id]="mobileMenuId"
        [attr.data-state]="mobileMenuOpen() ? 'open' : 'closed'"
        role="menu"
        aria-label="Mobile navigation">
        @for (item of items(); track item) {
          @if (item.routerLink(); as rl) {
            <a
              #mobileLink
              class="ct-navbar__link"
              [routerLink]="rl"
              routerLinkActive="ct-navbar__link--active"
              role="menuitem"
              [attr.aria-disabled]="item.disabled() || null"
              [attr.tabindex]="mobileMenuOpen() ? 0 : -1"
              (click)="onMobileItemClick($event, item)">
              {{ item.label() }}
            </a>
          } @else if (item.href()) {
            <a
              #mobileLink
              class="ct-navbar__link"
              [href]="item.href()"
              role="menuitem"
              [attr.aria-current]="item.active() ? 'page' : null"
              [attr.aria-disabled]="item.disabled() || null"
              [attr.tabindex]="mobileMenuOpen() ? 0 : -1"
              (click)="onMobileItemClick($event, item)">
              {{ item.label() }}
            </a>
          } @else {
            <button
              #mobileLink
              class="ct-navbar__link"
              type="button"
              role="menuitem"
              [attr.aria-current]="item.active() ? 'page' : null"
              [attr.aria-disabled]="item.disabled() || null"
              [attr.tabindex]="mobileMenuOpen() ? 0 : -1"
              (click)="onMobileItemClick($event, item)">
              {{ item.label() }}
            </button>
          }
        }
      </div>
    </header>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class AfNavbarComponent {
  private componentId = nextId++;
  private hostEl = inject(ElementRef);

  /** Size variant of the navbar. */
  size = input<AfNavbarSize>('md');

  /** Visual variant of the navbar. */
  variant = input<AfNavbarVariant>('default');

  /** Center the navigation items. */
  center = input(false, { transform: booleanAttribute });

  /** Accessible label for the navigation landmark. */
  ariaLabel = input('Main navigation');

  /** Projected nav item children. */
  items = contentChildren(AfNavItemComponent);

  /** Whether the mobile menu is currently open. */
  mobileMenuOpen = signal(false);

  readonly mobileMenuId = `af-navbar-mobile-${this.componentId}`;

  private focusedIndex = signal(0);
  private toggleRef = viewChild<ElementRef<HTMLButtonElement>>('toggleBtn');
  private mobileLinks = viewChildren<ElementRef<HTMLElement>>('mobileLink');

  navbarClasses = computed(() => {
    const classes = ['ct-navbar'];

    const sz = this.size();
    if (sz !== 'md') {
      classes.push(`ct-navbar--${sz}`);
    }

    const variant = this.variant();
    if (variant !== 'default') {
      classes.push(`ct-navbar--${variant}`);
    }

    if (this.center()) {
      classes.push('ct-navbar--center');
    }

    return classes.join(' ');
  });

  /** Manage roving tabindex across child nav items. */
  private rovingTabindexEffect = effect(() => {
    const items = this.items();
    const enabledItems = items.filter((i) => !i.disabled());
    let idx = this.focusedIndex();

    if (enabledItems.length === 0) {
      items.forEach((item) => item.rovingTabindex.set(-1));
      return;
    }

    if (idx >= enabledItems.length) {
      idx = 0;
    }

    let enabledCount = 0;
    items.forEach((item) => {
      if (item.disabled()) {
        item.rovingTabindex.set(-1);
      } else {
        item.rovingTabindex.set(enabledCount === idx ? 0 : -1);
        enabledCount++;
      }
    });
  });

  /** Toggle mobile menu open/closed and auto-focus the first enabled item. */
  toggleMobileMenu(): void {
    const willOpen = !this.mobileMenuOpen();
    this.mobileMenuOpen.set(willOpen);

    if (willOpen) {
      queueMicrotask(() => {
        const links = this.mobileLinks();
        const firstEnabledIdx = this.items().findIndex((i) => !i.disabled());
        if (firstEnabledIdx >= 0 && links[firstEnabledIdx]) {
          links[firstEnabledIdx].nativeElement.focus();
        }
      });
    }
  }

  onMobileItemClick(event: MouseEvent, item: AfNavItemComponent): void {
    if (item.disabled()) {
      event.preventDefault();
      return;
    }
    item.clicked.emit(event);
    this.mobileMenuOpen.set(false);
  }

  onDocumentClick(event: Event): void {
    if (!this.mobileMenuOpen()) return;
    const target = event.target as HTMLElement;
    if (!this.hostEl.nativeElement.contains(target)) {
      this.mobileMenuOpen.set(false);
    }
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.mobileMenuOpen()) {
      event.preventDefault();
      this.mobileMenuOpen.set(false);
      this.toggleRef()?.nativeElement.focus();
      return;
    }

    const target = event.target as HTMLElement;

    if (this.isMobileMenuTarget(target)) {
      this.handleMobileKeydown(event, target);
      return;
    }

    if (
      target.getAttribute('role') === 'menuitem' &&
      target.closest('[role="menubar"]')
    ) {
      this.handleDesktopKeydown(event);
    }
  }

  private handleDesktopKeydown(event: KeyboardEvent): void {
    const enabledItems = this.items().filter((i) => !i.disabled());
    if (enabledItems.length === 0) return;

    const currentIndex = this.focusedIndex();
    const last = enabledItems.length - 1;

    switch (event.key) {
      case 'ArrowRight': {
        event.preventDefault();
        const next = (currentIndex + 1) % enabledItems.length;
        this.focusedIndex.set(next);
        enabledItems[next].focusLink();
        break;
      }
      case 'ArrowLeft': {
        event.preventDefault();
        const prev =
          (currentIndex - 1 + enabledItems.length) % enabledItems.length;
        this.focusedIndex.set(prev);
        enabledItems[prev].focusLink();
        break;
      }
      case 'Home': {
        event.preventDefault();
        this.focusedIndex.set(0);
        enabledItems[0].focusLink();
        break;
      }
      case 'End': {
        event.preventDefault();
        this.focusedIndex.set(last);
        enabledItems[last].focusLink();
        break;
      }
    }
  }

  private handleMobileKeydown(
    event: KeyboardEvent,
    target: HTMLElement,
  ): void {
    const links = this.mobileLinks();
    const enabledIndices = this.items()
      .map((item, i) => ({ item, i }))
      .filter(({ item }) => !item.disabled())
      .map(({ i }) => i);

    if (enabledIndices.length === 0) return;

    const currentIdx = links.findIndex(
      (ref) => ref.nativeElement === target,
    );
    const enabledPosition = enabledIndices.indexOf(currentIdx);
    if (enabledPosition === -1) return;

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        const next =
          enabledIndices[(enabledPosition + 1) % enabledIndices.length];
        links[next].nativeElement.focus();
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        const prev =
          enabledIndices[
            (enabledPosition - 1 + enabledIndices.length) %
              enabledIndices.length
          ];
        links[prev].nativeElement.focus();
        break;
      }
      case 'Home': {
        event.preventDefault();
        links[enabledIndices[0]].nativeElement.focus();
        break;
      }
      case 'End': {
        event.preventDefault();
        links[
          enabledIndices[enabledIndices.length - 1]
        ].nativeElement.focus();
        break;
      }
    }
  }

  private isMobileMenuTarget(target: HTMLElement): boolean {
    return target.closest('.ct-navbar__mobile-menu') !== null;
  }
}

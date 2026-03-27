import {
  Component,
  ChangeDetectionStrategy,
  booleanAttribute,
  input,
  model,
  computed,
} from '@angular/core';
import { AfSkipLinkComponent } from '../skip-link';

export type AfShellSidebarState = 'expanded' | 'collapsed' | 'hidden';
export type AfShellPanelState = 'open' | 'closed';

/**
 * Page header rendered inside the main content area of an App Shell.
 *
 * Displays breadcrumbs, page title, and actions in a flex row.
 * Place inside `<af-app-shell>` without any slot attribute so it
 * projects into the main area.
 *
 * @example
 * <af-app-shell>
 *   <af-app-shell-page-header sticky>
 *     <nav aria-label="Breadcrumb">Home / Dashboard</nav>
 *     <h1>Dashboard</h1>
 *     <button class="ct-button">New Item</button>
 *   </af-app-shell-page-header>
 *   <p>Main content…</p>
 * </af-app-shell>
 */
@Component({
  selector: 'af-app-shell-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="classes()">
      <ng-content />
    </div>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export class AfAppShellPageHeaderComponent {
  /** Pin the page header to the top of the scrollable main area. */
  sticky = input(false, { transform: booleanAttribute });

  classes = computed(() => {
    const c = ['ct-app-shell__page-header'];
    if (this.sticky()) {
      c.push('ct-app-shell__page-header--sticky');
    }
    return c.join(' ');
  });
}

/**
 * Classic CSS-Grid App Shell that orchestrates header, sidebar,
 * main content, optional panel, and footer.
 *
 * Wraps the `ct-app-shell` CSS component from the Construct Design System.
 * Sidebar and panel states are two-way bindable via `model()` signals.
 *
 * Content projection slots:
 * - `[header]`    — Navbar / top bar
 * - `[sidebar]`   — Navigation sidebar
 * - `[panel]`     — Right-side contextual panel
 * - `[footer]`    — Footer area
 * - `[bottomNav]` — Mobile bottom navigation (requires `bottomNav` modifier)
 * - *(default)*   — Main content (including `<af-app-shell-page-header>`)
 *
 * @example
 * <af-app-shell [(sidebarState)]="sidebarState" [(panelState)]="panelState" sidebarFullHeight>
 *   <af-navbar header ariaLabel="Main">…</af-navbar>
 *   <af-sidebar sidebar ariaLabel="Navigation">…</af-sidebar>
 *   <af-app-shell-page-header sticky>
 *     <h1>Dashboard</h1>
 *   </af-app-shell-page-header>
 *   <p>Content goes here</p>
 *   <div panel>Inspector</div>
 *   <footer footer>&copy; 2026</footer>
 * </af-app-shell>
 */
@Component({
  selector: 'af-app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AfSkipLinkComponent],
  template: `
    <div
      [class]="shellClasses()"
      [attr.data-sidebar-state]="sidebarState()"
      [attr.data-panel-state]="panelState()">
      <af-skip-link [target]="mainId()" [label]="skipLinkLabel()" />

      <header class="ct-app-shell__header">
        <ng-content select="[header]" />
      </header>

      <aside class="ct-app-shell__sidebar" [attr.aria-label]="sidebarLabel()">
        <ng-content select="[sidebar]" />
      </aside>

      <main class="ct-app-shell__main" [id]="mainId()" tabindex="0">
        <ng-content />
      </main>

      <aside class="ct-app-shell__panel" [attr.aria-label]="panelLabel()">
        <ng-content select="[panel]" />
      </aside>

      <footer class="ct-app-shell__footer">
        <ng-content select="[footer]" />
      </footer>

      <div class="ct-app-shell__bottom-nav">
        <ng-content select="[bottomNav]" />
      </div>

      <div
        class="ct-app-shell__backdrop"
        (click)="onBackdropClick()"
        aria-hidden="true"></div>
    </div>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export class AfAppShellComponent {
  /** Current sidebar state — two-way bindable. */
  sidebarState = model<AfShellSidebarState>('expanded');

  /** Current panel state — two-way bindable. */
  panelState = model<AfShellPanelState>('closed');

  /** Remove the sidebar column entirely. */
  noSidebar = input(false, { transform: booleanAttribute });

  /** Place the sidebar on the right side. */
  sidebarRight = input(false, { transform: booleanAttribute });

  /** Sidebar spans the full viewport height (header sits beside it). */
  sidebarFullHeight = input(false, { transform: booleanAttribute });

  /** Stick the footer to the bottom with a top border. */
  footerSticky = input(false, { transform: booleanAttribute });

  /** Enable bottom navigation on mobile (hides sidebar and footer). */
  bottomNav = input(false, { transform: booleanAttribute });

  /** Accessible label for the sidebar landmark. */
  sidebarLabel = input('Site navigation');

  /** Accessible label for the panel landmark. */
  panelLabel = input('Details');

  /** ID of the main content element (used by skip-link). */
  mainId = input('main-content');

  /** Visible text of the skip-link. */
  skipLinkLabel = input('Skip to content');

  shellClasses = computed(() => {
    const classes = ['ct-app-shell'];

    if (this.noSidebar()) {
      classes.push('ct-app-shell--no-sidebar');
    }
    if (this.sidebarRight()) {
      classes.push('ct-app-shell--sidebar-right');
    }
    if (this.sidebarFullHeight()) {
      classes.push('ct-app-shell--sidebar-full-height');
    }
    if (this.footerSticky()) {
      classes.push('ct-app-shell--footer-sticky');
    }
    if (this.bottomNav()) {
      classes.push('ct-app-shell--bottom-nav');
    }

    return classes.join(' ');
  });

  /** Dismiss the mobile sidebar overlay. */
  onBackdropClick(): void {
    this.sidebarState.set('hidden');
  }
}

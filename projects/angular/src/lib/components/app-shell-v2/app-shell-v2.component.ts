import {
  Component,
  ChangeDetectionStrategy,
  booleanAttribute,
  input,
  model,
  computed,
} from '@angular/core';
import { AfSkipLinkComponent } from '../skip-link';
import { AfShellSidebarState, AfShellPanelState } from '../app-shell';

/**
 * Toolbar rendered inside the main content area of an App Shell V2.
 *
 * Replaces the classic full-width page header with a toolbar row
 * for breadcrumbs, page title, and actions. Place inside
 * `<af-app-shell-v2>` without any slot attribute so it projects
 * into the main area.
 *
 * @example
 * <af-app-shell-v2>
 *   <af-app-shell-v2-toolbar sticky>
 *     <nav aria-label="Breadcrumb">Home / Dashboard</nav>
 *     <div>
 *       <button class="ct-button">Export</button>
 *     </div>
 *   </af-app-shell-v2-toolbar>
 *   <p>Main content…</p>
 * </af-app-shell-v2>
 */
@Component({
  selector: 'af-app-shell-v2-toolbar',
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
export class AfAppShellV2ToolbarComponent {
  /** Pin the toolbar to the top of the scrollable main area. */
  sticky = input(false, { transform: booleanAttribute });

  classes = computed(() => {
    const c = ['ct-app-shell-v2__toolbar'];
    if (this.sticky()) {
      c.push('ct-app-shell-v2__toolbar--sticky');
    }
    return c.join(' ');
  });
}

/**
 * Floating-canvas App Shell with elevated surfaces, rounded corners,
 * and optional glass/branded modifiers.
 *
 * Wraps the `ct-app-shell-v2` CSS component from the Construct Design System.
 * Sidebar and panel states are two-way bindable via `model()` signals.
 *
 * Content projection slots:
 * - `[header]`   — Optional floating header bar (requires `withHeader` input)
 * - `[sidebar]`  — Floating sidebar surface
 * - `[panel]`    — Right-side contextual panel (inside body flex container)
 * - `[footer]`   — Footer inside the main area
 * - *(default)*  — Main content (including `<af-app-shell-v2-toolbar>`)
 *
 * @example
 * <af-app-shell-v2
 *   [(sidebarState)]="sidebarState"
 *   [(panelState)]="panelState"
 *   withHeader
 *   sidebarBranded
 *   glass>
 *   <af-navbar header ariaLabel="Main">…</af-navbar>
 *   <af-sidebar sidebar ariaLabel="Navigation">…</af-sidebar>
 *   <af-app-shell-v2-toolbar sticky>
 *     <h1>Dashboard</h1>
 *   </af-app-shell-v2-toolbar>
 *   <p>Content goes here</p>
 *   <div panel>Inspector</div>
 *   <footer footer>&copy; 2026</footer>
 * </af-app-shell-v2>
 */
@Component({
  selector: 'af-app-shell-v2',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AfSkipLinkComponent],
  template: `
    <div
      [class]="shellClasses()"
      [attr.data-sidebar-state]="sidebarState()"
      [attr.data-panel-state]="panelState()">
      <af-skip-link [target]="mainId()" [label]="skipLinkLabel()" />

      @if (withHeader()) {
        <header class="ct-app-shell-v2__header">
          <ng-content select="[header]" />
        </header>
      }

      <aside class="ct-app-shell-v2__sidebar" [attr.aria-label]="sidebarLabel()">
        <ng-content select="[sidebar]" />
      </aside>

      <div class="ct-app-shell-v2__body">
        <main class="ct-app-shell-v2__main" [id]="mainId()" tabindex="0">
          <ng-content />
          <div class="ct-app-shell-v2__footer">
            <ng-content select="[footer]" />
          </div>
        </main>

        <aside class="ct-app-shell-v2__panel" [attr.aria-label]="panelLabel()">
          <ng-content select="[panel]" />
        </aside>
      </div>

      <div
        class="ct-app-shell-v2__backdrop"
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
export class AfAppShellV2Component {
  /** Current sidebar state — two-way bindable. */
  sidebarState = model<AfShellSidebarState>('expanded');

  /** Current panel state — two-way bindable. */
  panelState = model<AfShellPanelState>('closed');

  /** Remove the sidebar entirely. */
  noSidebar = input(false, { transform: booleanAttribute });

  /** Place the sidebar on the right side. */
  sidebarRight = input(false, { transform: booleanAttribute });

  /** Sidebar spans the full viewport height (header sits beside it). */
  sidebarFullHeight = input(false, { transform: booleanAttribute });

  /** Show the optional floating header bar. */
  withHeader = input(false, { transform: booleanAttribute });

  /** Dark-branded sidebar (Slack / Linear / Discord aesthetic). */
  sidebarBranded = input(false, { transform: booleanAttribute });

  /** Frosted glass morphism effect on all floating surfaces. */
  glass = input(false, { transform: booleanAttribute });

  /** Accessible label for the sidebar landmark. */
  sidebarLabel = input('Site navigation');

  /** Accessible label for the panel landmark. */
  panelLabel = input('Details');

  /** ID of the main content element (used by skip-link). */
  mainId = input('main-content');

  /** Visible text of the skip-link. */
  skipLinkLabel = input('Skip to content');

  shellClasses = computed(() => {
    const classes = ['ct-app-shell-v2'];

    if (this.noSidebar()) {
      classes.push('ct-app-shell-v2--no-sidebar');
    }
    if (this.sidebarRight()) {
      classes.push('ct-app-shell-v2--sidebar-right');
    }
    if (this.sidebarFullHeight()) {
      classes.push('ct-app-shell-v2--sidebar-full-height');
    }
    if (this.withHeader()) {
      classes.push('ct-app-shell-v2--with-header');
    }
    if (this.sidebarBranded()) {
      classes.push('ct-app-shell-v2--sidebar-branded');
    }
    if (this.glass()) {
      classes.push('ct-app-shell-v2--glass');
    }

    return classes.join(' ');
  });

  /** Dismiss the mobile sidebar overlay. */
  onBackdropClick(): void {
    this.sidebarState.set('hidden');
  }
}

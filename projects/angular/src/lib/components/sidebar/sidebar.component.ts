import { Component, ChangeDetectionStrategy, input, model, computed } from '@angular/core';

export type AfSidebarMode = 'side' | 'over';

/**
 * Sidebar component for collapsible navigation
 *
 * @example
 * <af-sidebar [open]="sidebarOpen" mode="side" ariaLabel="Folder navigation" (openChange)="sidebarOpen = $event">
 *   <div header>
 *     <strong>Folders</strong>
 *   </div>
 *   <ul content class="ct-nav-list">
 *     <li><a class="ct-nav-item ct-nav-item--active" href="#" aria-current="page">
 *       <span class="ct-nav-item__label">Inbox</span>
 *       <span class="ct-nav-item__badge">12</span>
 *     </a></li>
 *   </ul>
 * </af-sidebar>
 */
@Component({
  selector: 'af-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
  template: `
    <aside
      [class]="sidebarClasses()"
      [attr.data-state]="open() ? 'open' : 'closed'"
      [attr.aria-label]="ariaLabel()">
      <div class="ct-sidebar__header">
        <ng-content select="[header]"></ng-content>
        @if (showCloseButton() && mode() === 'over') {
          <button
            class="ct-button ct-button--ghost ct-button--icon ct-button--sm"
            type="button"
            aria-label="Close menu"
            (click)="close()">
            <span class="ct-icon ct-icon--sm" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span>
          </button>
        }
      </div>
      <div class="ct-sidebar__content">
        <ng-content select="[content]"></ng-content>
        <ng-content></ng-content>
      </div>
    </aside>
    @if (mode() === 'over' && open()) {
      <div class="ct-sidebar__backdrop" (click)="close()"></div>
    }
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AfSidebarComponent {
  /** Sidebar open state */
  open = model(true);

  /** Display mode: side (pushes content) or over (overlays) */
  mode = input<AfSidebarMode>('side');

  /** Accessible label for the sidebar landmark */
  ariaLabel = input('Navigation');

  /** Show close button in overlay mode */
  showCloseButton = input(true);

  sidebarClasses = computed(() => {
    const classes = ['ct-sidebar'];
    classes.push(`ct-sidebar--${this.mode()}`);
    return classes.join(' ');
  });

  close(): void {
    this.open.set(false);
  }

  onEscape(): void {
    if (this.mode() === 'over' && this.open()) {
      this.close();
    }
  }
}

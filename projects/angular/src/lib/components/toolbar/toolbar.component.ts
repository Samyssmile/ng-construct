import { Component, ChangeDetectionStrategy, input } from '@angular/core';

/**
 * Toolbar component for top-level app navigation
 *
 * @example
 * <af-toolbar ariaLabel="Main navigation">
 *   <a brand href="#">Construct</a>
 *   <ul nav>
 *     <li><a href="/dashboard" class="ct-toolbar__nav-link ct-toolbar__nav-link--active" aria-current="page">Dashboard</a></li>
 *     <li><a href="/documents" class="ct-toolbar__nav-link">Documents</a></li>
 *   </ul>
 *   <div actions>
 *     <button class="ct-button ct-button--ghost">Profile</button>
 *   </div>
 * </af-toolbar>
 */
@Component({
  selector: 'af-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="ct-toolbar" [attr.aria-label]="ariaLabel()">
      <div class="ct-toolbar__brand">
        <ng-content select="[brand]"></ng-content>
      </div>
      <ng-content select="[nav]"></ng-content>
      <div class="ct-toolbar__spacer"></div>
      <div class="ct-toolbar__actions">
        <ng-content select="[actions]"></ng-content>
      </div>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AfToolbarComponent {
  /** Accessible label for the navigation landmark */
  ariaLabel = input('Main navigation');
}

import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface AfBreadcrumb {
  label: string;
  /** Angular Router link for SPA navigation (preferred for internal routes). */
  routerLink?: string | string[];
  /** Plain HTML href for external links. Causes a full page reload. */
  url?: string;
}

/**
 * Breadcrumbs navigation component with Angular Router support.
 *
 * Items with `routerLink` navigate via the Angular Router (no page reload).
 * Items with `url` render a plain `<a href>` (for external links).
 * The last item is always rendered as static text (current page).
 *
 * @example
 * <af-breadcrumbs [items]="[
 *   { label: 'Home', routerLink: '/' },
 *   { label: 'Documents', routerLink: '/documents' },
 *   { label: 'My Documents' }
 * ]"></af-breadcrumbs>
 */
@Component({
  selector: 'af-breadcrumbs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <nav class="ct-breadcrumbs" aria-label="Breadcrumb">
      <ol class="ct-breadcrumbs__list">
        @for (item of items(); track $index; let isLast = $last) {
          <li class="ct-breadcrumbs__item">
            @if (isLast) {
              <span class="ct-breadcrumbs__current" aria-current="page">{{ item.label }}</span>
            } @else if (item.routerLink) {
              <a class="ct-breadcrumbs__link" [routerLink]="item.routerLink">
                {{ item.label }}
              </a>
              <span class="ct-breadcrumbs__separator" aria-hidden="true">/</span>
            } @else if (item.url) {
              <a class="ct-breadcrumbs__link" [href]="item.url">
                {{ item.label }}
              </a>
              <span class="ct-breadcrumbs__separator" aria-hidden="true">/</span>
            } @else {
              <span class="ct-breadcrumbs__text">{{ item.label }}</span>
              <span class="ct-breadcrumbs__separator" aria-hidden="true">/</span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AfBreadcrumbsComponent {
  /** Breadcrumb items */
  items = input<AfBreadcrumb[]>([]);
}

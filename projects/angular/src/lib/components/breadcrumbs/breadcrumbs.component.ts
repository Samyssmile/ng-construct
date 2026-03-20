import { Component, ChangeDetectionStrategy, input } from '@angular/core';

export interface AfBreadcrumb {
  label: string;
  url?: string;
}

/**
 * Breadcrumbs navigation component
 *
 * @example
 * <af-breadcrumbs [items]="breadcrumbs"></af-breadcrumbs>
 */
@Component({
  selector: 'af-breadcrumbs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="ct-breadcrumbs" aria-label="Breadcrumb">
      <ol class="ct-breadcrumbs__list">
        @for (item of items(); track $index; let isLast = $last) {
          <li class="ct-breadcrumbs__item">
            @if (!isLast && item.url) {
              <a class="ct-breadcrumbs__link" [href]="item.url">
                {{ item.label }}
              </a>
              <span class="ct-breadcrumbs__separator">/</span>
            } @else {
              <span class="ct-breadcrumbs__current">{{ item.label }}</span>
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

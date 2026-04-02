import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface AfNavTab {
  /** Unique identifier for the tab. */
  id: string;
  /** Display label. */
  label: string;
  /** Angular Router link for navigation. */
  routerLink: string | string[];
  /** Disables the tab. */
  disabled?: boolean;
}

export type AfNavTabsVariant = 'default' | 'pill';
export type AfNavTabsSize = 'sm' | 'md' | 'lg';

/**
 * Router-based tab navigation component.
 *
 * Uses the `ct-tabs` CSS classes from the Construct Design System but renders
 * `<a routerLink>` elements for navigation. Active state is determined
 * automatically via `routerLinkActive`.
 *
 * For content-panel tabs (show/hide content without routing), use `<af-tabs>` instead.
 *
 * @example
 * <af-nav-tabs
 *   [tabs]="[
 *     { id: 'my', label: 'My Documents', routerLink: '/documents/my' },
 *     { id: 'all', label: 'All Documents', routerLink: '/documents/all' }
 *   ]">
 * </af-nav-tabs>
 */
@Component({
  selector: 'af-nav-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav [class]="containerClasses()" [attr.aria-label]="ariaLabel()">
      <ul class="ct-tabs__list">
        @for (tab of tabs(); track tab.id) {
          <li>
            @if (tab.disabled) {
              <span
                class="ct-tabs__trigger"
                aria-disabled="true"
                [attr.id]="'nav-tab-' + tab.id">
                {{ tab.label }}
              </span>
            } @else {
              <a
                class="ct-tabs__trigger"
                [routerLink]="tab.routerLink"
                routerLinkActive="ct-tabs__trigger--active"
                #rla="routerLinkActive"
                [attr.aria-current]="rla.isActive ? 'page' : null"
                [attr.id]="'nav-tab-' + tab.id">
                {{ tab.label }}
              </a>
            }
          </li>
        }
      </ul>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    li {
      display: contents;
    }

    .ct-tabs__trigger--active {
      color: var(--color-text-primary);
    }

    .ct-tabs__trigger--active::after {
      background: var(--ct-tabs-indicator-color, var(--color-brand-primary));
    }

    .ct-tabs--pill .ct-tabs__trigger--active {
      background: var(--color-bg-elevated);
      box-shadow: var(--shadow-sm);
    }

    .ct-tabs--pill .ct-tabs__trigger--active::after {
      display: none;
    }

    .ct-tabs__trigger[aria-disabled='true'] {
      color: var(--color-text-muted);
      opacity: var(--opacity-disabled, 0.5);
      cursor: not-allowed;
      pointer-events: none;
    }
  `]
})
export class AfNavTabsComponent {
  /** Tab items to render. */
  tabs = input.required<AfNavTab[]>();

  /** Visual variant. `'pill'` renders pill-shaped tabs with background. */
  variant = input<AfNavTabsVariant>('default');

  /** Size variant. */
  size = input<AfNavTabsSize>('md');

  /** Accessible label for the tab navigation. */
  ariaLabel = input('Sub navigation');

  containerClasses = computed(() => {
    const classes = ['ct-tabs'];
    const v = this.variant();
    if (v === 'pill') classes.push('ct-tabs--pill');
    const s = this.size();
    if (s !== 'md') classes.push(`ct-tabs--${s}`);
    return classes.join(' ');
  });
}

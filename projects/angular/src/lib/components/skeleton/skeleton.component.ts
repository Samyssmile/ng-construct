import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  numberAttribute,
} from '@angular/core';

export type AfSkeletonVariant = 'text' | 'title' | 'avatar' | 'rect';

/**
 * Skeleton placeholder component for loading states.
 * Renders animated placeholders while content is loading.
 *
 * @example
 * <af-skeleton variant="text" count="3"></af-skeleton>
 * <af-skeleton variant="avatar"></af-skeleton>
 * <af-skeleton variant="rect" width="200px" height="120px"></af-skeleton>
 */
@Component({
  selector: 'af-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'status',
    '[attr.aria-busy]': '"true"',
    '[attr.aria-label]': 'label()',
  },
  template: `
    @for (_ of items(); track $index) {
      <span
        [class]="skeletonClasses()"
        [attr.style]="skeletonStyle()"
        aria-hidden="true"
      ></span>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
      span + span {
        margin-top: 0.5rem;
      }
    `,
  ],
})
export class AfSkeletonComponent {
  /** Visual variant of the skeleton placeholder */
  variant = input<AfSkeletonVariant>('text');

  /** Custom width (CSS value, e.g. '200px', '50%') */
  width = input<string>();

  /** Custom height (CSS value, e.g. '100px', '2em') */
  height = input<string>();

  /** Number of skeleton lines to render */
  count = input(1, { transform: numberAttribute });

  /** Accessible label for screen readers */
  label = input('Loading\u2026');

  items = computed(() => Array.from({ length: this.count() }));

  skeletonClasses = computed(() => {
    return `ct-skeleton ct-skeleton--${this.variant()}`;
  });

  skeletonStyle = computed(() => {
    const w = this.width();
    const h = this.height();
    if (!w && !h) return null;
    const parts: string[] = [];
    if (w) parts.push(`--ct-skeleton-width: ${w}`);
    if (h) parts.push(`--ct-skeleton-height: ${h}`);
    return parts.join('; ');
  });
}

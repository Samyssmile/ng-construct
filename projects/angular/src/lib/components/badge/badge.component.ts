import { Component, ChangeDetectionStrategy, booleanAttribute, input, computed } from '@angular/core';

export type AfBadgeVariant = 'default' | 'info' | 'success' | 'warning' | 'danger';

/**
 * Badge component for status indicators, labels, and counts.
 *
 * Wraps the Construct Design System `ct-badge` with semantic color
 * variants and optional icon or dot indicators.
 *
 * @example Basic usage
 * <af-badge variant="success">Approved</af-badge>
 *
 * @example With icon
 * <af-badge variant="danger" icon="+">Blocked</af-badge>
 *
 * @example With dot indicator
 * <af-badge variant="info" dot>Online</af-badge>
 *
 * @example Status badge for screen readers
 * <af-badge variant="warning" role="status" ariaLabel="Build status: failing">
 *   Failing
 * </af-badge>
 *
 * @accessibility
 * - Non-interactive element — no keyboard navigation required.
 * - Decorative elements (icon, dot) are hidden from screen readers via `aria-hidden`.
 * - Use `ariaLabel` when the badge has no visible text or when the visual content
 *   alone does not convey the full meaning.
 * - Set `role="status"` when the badge reflects a live value that screen readers
 *   should announce on change.
 */
@Component({
  selector: 'af-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'badgeClasses()',
    '[attr.role]': 'role() || null',
    '[attr.aria-label]': 'ariaLabel() || null',
  },
  template: `
    @if (icon()) {
      <span class="ct-badge__icon" aria-hidden="true">{{ icon() }}</span>
    }
    @if (dot()) {
      <span class="ct-badge__dot" aria-hidden="true"></span>
    }
    <ng-content />
  `,
})
export class AfBadgeComponent {
  /** ARIA role, e.g. `"status"` for live status badges. */
  role = input('');

  /** Accessible label, useful when the badge has no visible text. */
  ariaLabel = input('');

  /** Semantic color variant. */
  variant = input<AfBadgeVariant>('default');

  /** Icon character to display before the label. */
  icon = input('');

  /** Show a dot indicator instead of an icon. */
  dot = input(false, { transform: booleanAttribute });

  /** Computed CSS classes combining base class and variant/icon modifiers. */
  badgeClasses = computed(() => {
    const classes = ['ct-badge'];
    if (this.variant() !== 'default') {
      classes.push(`ct-badge--${this.variant()}`);
    }
    if (this.icon() || this.dot()) {
      classes.push('ct-badge--icon');
    }
    return classes.join(' ');
  });
}

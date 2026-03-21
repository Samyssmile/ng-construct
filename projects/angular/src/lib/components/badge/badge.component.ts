import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

export type AfBadgeVariant = 'default' | 'info' | 'success' | 'warning' | 'danger';

/**
 * Badge component for status indicators
 *
 * @example
 * <af-badge variant="success" icon="+">Approved</af-badge>
 * <af-badge variant="danger">Blocked</af-badge>
 */
@Component({
  selector: 'af-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="badgeClasses()" [attr.aria-label]="ariaLabel() || null">
      @if (icon()) {
        <span class="ct-badge__icon" aria-hidden="true">{{ icon() }}</span>
      }
      @if (dot()) {
        <span class="ct-badge__dot" aria-hidden="true"></span>
      }
      <ng-content />
    </span>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class AfBadgeComponent {
  /** Accessible label, useful when the badge has no visible text. */
  ariaLabel = input('');

  /** Color variant. */
  variant = input<AfBadgeVariant>('default');

  /** Icon character to display */
  icon = input('');

  /** Show a dot indicator instead of icon */
  dot = input(false);

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

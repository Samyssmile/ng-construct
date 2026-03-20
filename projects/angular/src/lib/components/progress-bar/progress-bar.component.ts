import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

export type AfProgressBarVariant = 'default' | 'info' | 'success' | 'warning' | 'danger';
export type AfProgressBarSize = 'sm' | 'md' | 'lg';

/**
 * Progress bar for showing completion state
 *
 * @example
 * <af-progress-bar [value]="75" variant="success" label="Upload progress"></af-progress-bar>
 * <af-progress-bar [indeterminate]="true" label="Loading"></af-progress-bar>
 */
@Component({
  selector: 'af-progress-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [class]="barClasses()"
      role="progressbar"
      [attr.aria-valuenow]="indeterminate() ? null : value()"
      [attr.aria-valuemin]="indeterminate() ? null : 0"
      [attr.aria-valuemax]="indeterminate() ? null : 100"
      [attr.aria-label]="label()">
      <div
        class="ct-progress-bar__track"
        [style.width]="indeterminate() ? null : value() + '%'">
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AfProgressBarComponent {
  /** Current progress value (0-100) */
  value = input(0);

  /** Color variant */
  variant = input<AfProgressBarVariant>('default');

  /** Track height */
  size = input<AfProgressBarSize>('md');

  /** Accessible label for screen readers */
  label = input('');

  /** Indeterminate mode (animated, no fixed value) */
  indeterminate = input(false);

  barClasses = computed(() => {
    const classes = ['ct-progress-bar'];
    if (this.variant() !== 'default') {
      classes.push(`ct-progress-bar--${this.variant()}`);
    }
    if (this.size() !== 'md') {
      classes.push(`ct-progress-bar--${this.size()}`);
    }
    if (this.indeterminate()) {
      classes.push('ct-progress-bar--indeterminate');
    }
    return classes.join(' ');
  });
}

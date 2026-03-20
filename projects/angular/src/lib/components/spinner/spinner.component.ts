import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

export type AfSpinnerSize = 'sm' | 'md' | 'lg';

/**
 * Spinner component for loading states
 *
 * @example
 * <af-spinner label="Loading data"></af-spinner>
 * <af-spinner size="lg" label="Processing"></af-spinner>
 */
@Component({
  selector: 'af-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      [class]="spinnerClasses()"
      role="status"
      [attr.aria-label]="label()">
    </span>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class AfSpinnerComponent {
  /** Spinner size */
  size = input<AfSpinnerSize>('md');

  /** Accessible label for screen readers */
  label = input('Loading');

  spinnerClasses = computed(() => {
    const classes = ['ct-spinner'];
    if (this.size() !== 'md') {
      classes.push(`ct-spinner--${this.size()}`);
    }
    return classes.join(' ');
  });
}

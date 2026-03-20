import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

export type AfIconSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Icon component that abstracts the icon rendering strategy.
 *
 * Currently uses Material Icons font ligatures. The icon strategy
 * can be changed centrally without modifying consumers.
 *
 * @example
 * <af-icon name="delete" />
 * <af-icon name="edit" size="sm" />
 */
@Component({
  selector: 'af-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="iconClasses()" aria-hidden="true">{{ name() }}</span>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class AfIconComponent {
  /** Material Icon name (ligature) */
  name = input.required<string>();

  /** Icon size variant */
  size = input<AfIconSize>('md');

  iconClasses = computed(() => {
    const classes = ['ct-icon', 'material-icons'];
    if (this.size() !== 'md') {
      classes.push(`ct-icon--${this.size()}`);
    }
    return classes.join(' ');
  });
}

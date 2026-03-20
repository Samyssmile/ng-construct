import { Component, ChangeDetectionStrategy, booleanAttribute, input, output, computed } from '@angular/core';

export type AfButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'accent' | 'link';
export type AfButtonSize = 'sm' | 'md' | 'lg';
export type AfButtonType = 'button' | 'submit' | 'reset';

/**
 * Button component from the Construct Design System
 *
 * @example
 * <af-button variant="primary" (clicked)="handleClick()">Click me</af-button>
 *
 * @example Icon-only button
 * <af-button variant="ghost" size="sm" iconOnly ariaLabel="Delete item">
 *   <af-icon name="delete" />
 * </af-button>
 */
@Component({
  selector: 'af-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      [class]="buttonClasses()"
      [attr.aria-label]="ariaLabel() || null"
      [attr.title]="title() || null"
      (click)="handleClick($event)">
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class AfButtonComponent {
  /** Button variant/style */
  variant = input<AfButtonVariant>('primary');

  /** Button size */
  size = input<AfButtonSize>('md');

  /** Button type attribute */
  type = input<AfButtonType>('button');

  /** Whether button is disabled */
  disabled = input(false, { transform: booleanAttribute });

  /** Whether this is an icon-only button (no visible text) */
  iconOnly = input(false, { transform: booleanAttribute });

  /** Accessible label for icon-only buttons */
  ariaLabel = input('');

  /** Tooltip text shown on hover */
  title = input('');

  /** Click event emitter */
  clicked = output<MouseEvent>();

  buttonClasses = computed(() => {
    const classes = ['ct-button'];

    if (this.variant() !== 'primary') {
      classes.push(`ct-button--${this.variant()}`);
    }

    if (this.size() !== 'md') {
      classes.push(`ct-button--${this.size()}`);
    }

    if (this.iconOnly()) {
      classes.push('ct-button--icon');
    }

    return classes.join(' ');
  });

  handleClick(event: MouseEvent): void {
    if (!this.disabled()) {
      this.clicked.emit(event);
    }
  }
}

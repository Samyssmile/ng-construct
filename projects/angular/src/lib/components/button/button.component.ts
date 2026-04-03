import { Component, ChangeDetectionStrategy, booleanAttribute, input, output, computed, isDevMode, effect } from '@angular/core';

export type AfButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'accent' | 'link';
export type AfButtonSize = 'sm' | 'md' | 'lg';
export type AfButtonType = 'button' | 'submit' | 'reset';

/**
 * Button component from the Construct Design System.
 *
 * Wraps a native `<button>` element with design system tokens and
 * variant/size modifiers.
 *
 * @example Basic usage
 * <af-button variant="primary" (clicked)="save()">Save</af-button>
 *
 * @example Variants
 * <af-button variant="secondary">Secondary</af-button>
 * <af-button variant="ghost">Ghost</af-button>
 * <af-button variant="outline">Outline</af-button>
 * <af-button variant="danger">Danger</af-button>
 * <af-button variant="accent">Accent</af-button>
 * <af-button variant="link">Link</af-button>
 *
 * @example Icon-only button (ariaLabel required)
 * <af-button variant="ghost" size="sm" iconOnly ariaLabel="Delete item">
 *   <af-icon name="delete" />
 * </af-button>
 *
 * @example Disabled button
 * <af-button [disabled]="true">Cannot click</af-button>
 *
 * @accessibility
 * - Uses native `<button>` element — keyboard (Enter/Space) and screen reader support built-in.
 * - Disabled state uses the native `disabled` attribute.
 * - Icon-only buttons must provide `ariaLabel` for screen reader users.
 *   A dev-mode warning is emitted if `ariaLabel` is missing on an icon-only button.
 * - Focus indicator: 2px outline via `:focus-visible` (design system CSS).
 * - Reduced motion: `transform` animation disabled via `prefers-reduced-motion`.
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

  private readonly iconOnlyWarning = effect(() => {
    if (isDevMode() && this.iconOnly() && !this.ariaLabel()) {
      console.warn('af-button: iconOnly buttons require an ariaLabel for screen readers.');
    }
  });

  handleClick(event: MouseEvent): void {
    if (!this.disabled()) {
      this.clicked.emit(event);
    }
  }
}

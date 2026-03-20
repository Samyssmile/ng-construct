import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

export type AfDividerOrientation = 'horizontal' | 'vertical';
export type AfDividerColor = 'default' | 'strong' | 'muted';
export type AfDividerSpacing = 'sm' | 'md' | 'lg' | 'none';

/**
 * Divider component for visually separating content sections.
 *
 * @example
 * <af-divider />
 * <af-divider orientation="vertical" />
 * <af-divider color="strong" spacing="lg" />
 * <af-divider label="Section" />
 */
@Component({
  selector: 'af-divider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'separator',
    '[attr.aria-orientation]': 'orientation()',
    '[class]': 'dividerClasses()',
  },
  template: `
    @if (label()) {
      <span class="ct-divider__label">{{ label() }}</span>
    }
  `,
})
export class AfDividerComponent {
  /** Orientation of the divider. */
  orientation = input<AfDividerOrientation>('horizontal');

  /** Color variant of the divider line. */
  color = input<AfDividerColor>('default');

  /** Spacing around the divider. */
  spacing = input<AfDividerSpacing>('md');

  /** Optional label text displayed in the center of the divider. */
  label = input('');

  dividerClasses = computed(() => {
    const classes = ['ct-divider'];

    if (this.orientation() === 'vertical') {
      classes.push('ct-divider--vertical');
    }

    if (this.color() !== 'default') {
      classes.push(`ct-divider--${this.color()}`);
    }

    if (this.spacing() !== 'md') {
      classes.push(`ct-divider--${this.spacing()}`);
    }

    if (this.label()) {
      classes.push('ct-divider--labeled');
    }

    return classes.join(' ');
  });
}

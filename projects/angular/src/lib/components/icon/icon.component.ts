import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

export type AfIconSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Icon wrapper that applies Construct Design System sizing via `ct-icon` classes.
 *
 * Uses content projection so any icon source can be used:
 * Lucide, custom SVGs, or other icon libraries.
 *
 * @example Using with Lucide
 * ```html
 * <af-icon size="sm">
 *   <lucide-x />
 * </af-icon>
 * ```
 *
 * @example Using with inline SVG
 * ```html
 * <af-icon size="lg">
 *   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
 *     <circle cx="12" cy="12" r="10" />
 *   </svg>
 * </af-icon>
 * ```
 */
@Component({
  selector: 'af-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="iconClasses()" aria-hidden="true">
      <ng-content />
    </span>
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
  /** Icon size variant */
  size = input<AfIconSize>('md');

  iconClasses = computed(() => {
    const classes = ['ct-icon'];
    if (this.size() !== 'md') {
      classes.push(`ct-icon--${this.size()}`);
    }
    return classes.join(' ');
  });
}

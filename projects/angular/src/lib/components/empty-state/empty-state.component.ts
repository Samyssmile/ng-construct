import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from '@angular/core';

export type AfEmptyStateSize = 'sm' | 'md' | 'lg';
export type AfEmptyStateVariant = 'default' | 'error';

/**
 * Empty state component for displaying placeholder content when no data is available.
 *
 * Supports content projection for icon, title, description, and actions.
 * Alternatively, use the `icon` input for simple text/emoji icons.
 *
 * @example
 * <af-empty-state variant="default" size="md" [bordered]="true">
 *   <span icon>📦</span>
 *   <span title>No items found</span>
 *   <span description>Try adjusting your search or filter criteria.</span>
 *   <div actions>
 *     <button class="ct-button ct-button--primary">Add Item</button>
 *   </div>
 * </af-empty-state>
 *
 * @example
 * <af-empty-state icon="🔍" variant="error">
 *   <span title>Search failed</span>
 *   <span description>An error occurred while searching.</span>
 * </af-empty-state>
 */
@Component({
  selector: 'af-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="containerClasses()" role="status">
      <div class="ct-empty-state__icon" aria-hidden="true">
        @if (icon()) {
          {{ icon() }}
        } @else {
          <ng-content select="[icon]" />
        }
      </div>
      <p class="ct-empty-state__title">
        <ng-content select="[title]" />
      </p>
      <p class="ct-empty-state__description">
        <ng-content select="[description]" />
      </p>
      <div class="ct-empty-state__actions">
        <ng-content select="[actions]" />
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class AfEmptyStateComponent {
  /** Size variant controlling icon size, padding, and font sizes */
  size = input<AfEmptyStateSize>('md');

  /** Visual variant — `error` highlights icon and title in danger color */
  variant = input<AfEmptyStateVariant>('default');

  /** Whether to display a dashed border around the empty state */
  bordered = input(false);

  /** Icon character or emoji to display (alternative to icon content projection) */
  icon = input('');

  containerClasses = computed(() => {
    const classes = ['ct-empty-state'];

    const s = this.size();
    if (s !== 'md') {
      classes.push(`ct-empty-state--${s}`);
    }

    if (this.variant() === 'error') {
      classes.push('ct-empty-state--error');
    }

    if (this.bordered()) {
      classes.push('ct-empty-state--bordered');
    }

    return classes.join(' ');
  });
}

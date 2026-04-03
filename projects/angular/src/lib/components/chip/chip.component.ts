import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  model,
  output,
} from '@angular/core';

export type AfChipVariant = 'default' | 'info' | 'success' | 'warning' | 'danger';
export type AfChipAppearance = 'subtle' | 'outline' | 'solid';
export type AfChipSize = 'sm' | 'md' | 'lg';

/**
 * Chip component for labels, tags, statuses, and interactive filters.
 *
 * @example Static chip
 * <af-chip variant="success" size="sm">Resolved</af-chip>
 *
 * @example Toggle chip with two-way binding
 * <af-chip selectable [(selected)]="isActive">Filter</af-chip>
 *
 * @example Removable chip
 * <af-chip removable (removed)="onRemove()">Status: Active</af-chip>
 */
@Component({
  selector: 'af-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'chipClasses()',
    '[attr.role]': 'chipRole()',
    '[attr.tabindex]': 'selectable() && !removable() && !disabled() ? "0" : null',
    '[attr.aria-pressed]': 'selectable() && !removable() ? selected() : null',
    '[attr.aria-disabled]': 'disabled() || null',
    '[attr.aria-label]': 'ariaLabel() || null',
    '(click)': 'handleClick()',
    '(keydown.enter)': 'handleKeydown($event)',
    '(keydown.space)': 'handleKeydown($event)',
    '(keydown.delete)': 'handleRemoveKeydown($event)',
    '(keydown.backspace)': 'handleRemoveKeydown($event)',
  },
  template: `
    <span
      class="ct-chip__action"
      [attr.role]="selectable() && removable() ? 'button' : null"
      [attr.tabindex]="selectable() && removable() && !disabled() ? '0' : null"
      [attr.aria-pressed]="selectable() && removable() ? selected() : null">
      @if (dot()) {
        <span class="ct-chip__dot" aria-hidden="true"></span>
      } @else {
        <span class="ct-chip__avatar">
          <ng-content select="[chipAvatar]" />
        </span>

        <span [class]="iconClasses()" aria-hidden="true">
          <ng-content select="af-icon,[chipIcon]" />
        </span>
      }

      <span class="ct-chip__label">
        <ng-content />
      </span>

      @if (selectable()) {
        <span class="ct-chip__check" aria-hidden="true"></span>
      }
    </span>

    @if (removable() && !disabled()) {
      <button
        type="button"
        class="ct-chip__remove"
        [attr.aria-label]="removeAriaLabel()"
        (click)="handleRemove($event)">
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
    }
    .ct-chip__action {
      display: contents;
    }
    .ct-chip__action:focus-visible {
      outline: none;
    }
    :host:has(.ct-chip__action:focus-visible) {
      outline: 2px solid var(--color-focus-ring, Highlight);
      outline-offset: 2px;
    }
    .ct-chip__icon:not(:has(*)),
    .ct-chip__avatar:not(:has(*)) {
      display: none;
    }
  `,
})
export class AfChipComponent {
  /** Semantic color variant. */
  variant = input<AfChipVariant>('default');

  /** Visual style: subtle (filled background), outline, or solid. */
  appearance = input<AfChipAppearance>('subtle');

  /** Size of the chip. */
  size = input<AfChipSize>('md');

  /** Opaque value for identifying this chip in lists or groups. */
  value = input<unknown>();

  /** Enables toggle behavior with hover, active, focus styles, and keyboard support. */
  selectable = input(false, { transform: booleanAttribute });

  /** Selected state for toggle chips. Supports two-way binding via `[(selected)]`. */
  selected = model(false);

  /** Disables the chip, preventing all interaction. */
  disabled = input(false, { transform: booleanAttribute });

  /** Shows a remove button inside the chip. */
  removable = input(false, { transform: booleanAttribute });

  /** Shows a dot status indicator instead of an icon. */
  dot = input(false, { transform: booleanAttribute });

  /** Accessible label for icon-only or truncated chips. */
  ariaLabel = input<string>();

  /** Accessible label for the remove button. Should be localized by the consumer. */
  removeAriaLabel = input('Remove');

  /** Emits the chip's `value` when the remove button is clicked or Delete/Backspace is pressed. */
  removed = output<unknown>();

  chipRole = computed(() => {
    if (!this.selectable()) return null;
    return this.removable() ? 'group' : 'button';
  });

  iconClasses = computed(() => {
    const classes = ['ct-chip__icon'];
    if (this.variant() !== 'default') {
      classes.push(`ct-chip__icon--${this.variant()}`);
    }
    return classes.join(' ');
  });

  chipClasses = computed(() => {
    const classes = ['ct-chip'];

    if (this.size() !== 'md') {
      classes.push(`ct-chip--${this.size()}`);
    }

    if (this.appearance() !== 'subtle') {
      classes.push(`ct-chip--${this.appearance()}`);
    }

    if (this.variant() !== 'default') {
      classes.push(`ct-chip--${this.variant()}`);
    }

    if (this.selectable()) {
      classes.push('ct-chip--interactive');
    }

    if (this.selectable() && this.selected()) {
      classes.push('ct-chip--selected');
    }

    if (this.disabled()) {
      classes.push('ct-chip--disabled');
    }

    return classes.join(' ');
  });

  handleClick(): void {
    if (!this.selectable() || this.disabled()) return;
    this.selected.update(v => !v);
  }

  handleKeydown(event: Event): void {
    if ((event.target as HTMLElement).closest('.ct-chip__remove')) return;
    if (!this.selectable() || this.disabled()) return;
    event.preventDefault();
    this.selected.update(v => !v);
  }

  handleRemoveKeydown(event: Event): void {
    if (!this.removable() || this.disabled()) return;
    event.preventDefault();
    this.removed.emit(this.value());
  }

  handleRemove(event: MouseEvent): void {
    event.stopPropagation();
    this.removed.emit(this.value());
  }
}

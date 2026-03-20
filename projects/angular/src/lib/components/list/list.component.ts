import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

export type AfListVariant = 'default' | 'bordered' | 'interactive';
export type AfListSize = 'sm' | 'md' | 'lg';

// ── List Item ─────────────────────────────────────────────────────────────────

/**
 * Individual item within an `af-list`.
 *
 * Content projection slots:
 * - `[leading]` — Leading slot for icons or avatars
 * - Default — Main content area (title, description, meta)
 * - `[trailing]` — Trailing slot for badges, actions, or chevrons
 */
@Component({
  selector: 'af-list-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <li
      #itemEl
      [class]="itemClasses()"
      [attr.role]="itemRole()"
      [attr.aria-selected]="ariaSelected()"
      [attr.aria-disabled]="disabled() || null"
      [attr.tabindex]="tabindex()"
      (click)="onClick($event)"
      (keydown)="onKeydown($event)">
      <div class="ct-list__item-leading" aria-hidden="true">
        <ng-content select="[leading]" />
      </div>
      <div class="ct-list__item-content">
        <ng-content />
      </div>
      <div class="ct-list__item-trailing">
        <ng-content select="[trailing]" />
      </div>
    </li>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
      .ct-list__item-leading:empty,
      .ct-list__item-trailing:empty {
        display: none;
      }
    `,
  ],
})
export class AfListItemComponent {
  private list = inject(forwardRef(() => AfListComponent), { optional: true });

  /** Makes the item individually interactive with hover/active states. */
  interactive = input(false, { transform: booleanAttribute });

  /** Marks the item as visually active/highlighted. */
  active = input(false, { transform: booleanAttribute });

  /** Disables the item, preventing interaction. */
  disabled = input(false, { transform: booleanAttribute });

  /** Marks the item as selected (sets `aria-selected` in interactive variant). */
  selected = input(false, { transform: booleanAttribute });

  /** Emits when the item is clicked or activated via keyboard. */
  clicked = output<MouseEvent>();

  tabindex = signal<number | null>(null);

  itemRef = viewChild.required<ElementRef<HTMLLIElement>>('itemEl');

  itemClasses = computed(() => {
    const classes = ['ct-list__item'];
    if (this.interactive() || this.list?.variant() === 'interactive') {
      classes.push('ct-list__item--interactive');
    }
    if (this.active()) {
      classes.push('ct-list__item--active');
    }
    return classes.join(' ');
  });

  itemRole = computed(() => {
    return this.list?.variant() === 'interactive' ? 'option' : null;
  });

  ariaSelected = computed(() => {
    if (this.list?.variant() !== 'interactive') return null;
    return this.selected() ? 'true' : 'false';
  });

  /** Focuses the underlying list item element. */
  focusItem(): void {
    this.itemRef().nativeElement.focus();
  }

  onClick(event: MouseEvent): void {
    if (this.disabled()) {
      event.preventDefault();
      return;
    }
    this.clicked.emit(event);
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;
    if (event.key === 'Enter' || event.key === ' ') {
      if (this.list?.variant() === 'interactive' || this.interactive()) {
        event.preventDefault();
        this.clicked.emit(new MouseEvent('click'));
      }
    }
  }
}

// ── List ──────────────────────────────────────────────────────────────────────

/**
 * Container component for a list of `af-list-item` elements.
 *
 * Renders as `<ul>` by default, or `<ol>` when `ordered` is set.
 * The `interactive` variant enables keyboard navigation and listbox semantics.
 */
@Component({
  selector: 'af-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(keydown)': 'handleKeydown($event)',
  },
  template: `
    @if (ordered()) {
      <ol [class]="listClasses()" [attr.aria-label]="ariaLabel() || null">
        <ng-content />
      </ol>
    } @else {
      <ul
        [class]="listClasses()"
        [attr.role]="listRole()"
        [attr.aria-label]="ariaLabel() || null">
        <ng-content />
      </ul>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class AfListComponent {
  /** Visual/behavioral variant. `interactive` enables selectable items with keyboard navigation. */
  variant = input<AfListVariant>('default');

  /** Size of the list (affects padding, font sizes, and icon sizes). */
  size = input<AfListSize>('md');

  /** Compact spacing for list items. */
  dense = input(false, { transform: booleanAttribute });

  /** Renders as `<ol>` instead of `<ul>` for ordered content. */
  ordered = input(false, { transform: booleanAttribute });

  /** Accessible label for the list element. */
  ariaLabel = input('');

  items = contentChildren(AfListItemComponent);

  private focusedIndex = signal(0);

  listClasses = computed(() => {
    const classes = ['ct-list'];
    const v = this.variant();
    if (v === 'bordered') {
      classes.push('ct-list--bordered');
    } else if (v === 'interactive') {
      classes.push('ct-list--selectable');
    }
    const sz = this.size();
    if (sz !== 'md') {
      classes.push(`ct-list--${sz}`);
    }
    if (this.dense()) {
      classes.push('ct-list--dense');
    }
    return classes.join(' ');
  });

  listRole = computed(() => {
    return this.variant() === 'interactive' ? 'listbox' : null;
  });

  private rovingTabindexEffect = effect(() => {
    const variant = this.variant();
    const items = this.items();

    if (variant !== 'interactive') {
      items.forEach((item) => item.tabindex.set(item.interactive() ? 0 : null));
      return;
    }

    const enabledItems = items.filter((i) => !i.disabled());
    let idx = this.focusedIndex();

    if (enabledItems.length === 0) {
      items.forEach((item) => item.tabindex.set(-1));
      return;
    }

    if (idx >= enabledItems.length) {
      idx = 0;
    }

    let enabledCount = 0;
    items.forEach((item) => {
      if (item.disabled()) {
        item.tabindex.set(-1);
      } else {
        item.tabindex.set(enabledCount === idx ? 0 : -1);
        enabledCount++;
      }
    });
  });

  handleKeydown(event: KeyboardEvent): void {
    if (this.variant() !== 'interactive') return;

    const target = event.target as HTMLElement;
    const closestItem = target.closest('.ct-list__item') as HTMLElement | null;
    if (!closestItem) return;

    const enabledItems = this.items().filter((i) => !i.disabled());
    if (enabledItems.length === 0) return;

    const currentIndex = enabledItems.findIndex(
      (item) => item.itemRef().nativeElement === closestItem,
    );
    if (currentIndex === -1) return;

    const last = enabledItems.length - 1;

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        const next = (currentIndex + 1) % enabledItems.length;
        this.focusedIndex.set(next);
        enabledItems[next].focusItem();
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        const prev = (currentIndex - 1 + enabledItems.length) % enabledItems.length;
        this.focusedIndex.set(prev);
        enabledItems[prev].focusItem();
        break;
      }
      case 'Home': {
        event.preventDefault();
        this.focusedIndex.set(0);
        enabledItems[0].focusItem();
        break;
      }
      case 'End': {
        event.preventDefault();
        this.focusedIndex.set(last);
        enabledItems[last].focusItem();
        break;
      }
    }
  }
}

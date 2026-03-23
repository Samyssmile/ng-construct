import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';

import { AfButtonSize } from '../button/button.component';

export interface AfDropdownItem {
  label: string;
  value: unknown;
  disabled?: boolean;
  separator?: boolean;
}

/**
 * Dropdown menu component implementing the WAI-ARIA Menu Pattern.
 *
 * Provides full keyboard navigation (Arrow keys, Home/End, type-ahead),
 * proper ARIA roles (`menu` / `menuitem`), and roving tabindex focus management.
 *
 * @example
 * <af-dropdown
 *   label="Actions"
 *   [items]="menuItems"
 *   (itemSelected)="handleAction($event)">
 * </af-dropdown>
 */
@Component({
  selector: 'af-dropdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
  template: `
    <div class="ct-dropdown" [attr.data-state]="isOpen() ? 'open' : 'closed'" [attr.data-align]="align()" [attr.data-side]="side()">
      <button
        #trigger
        [id]="triggerId"
        [class]="triggerClasses()"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-controls]="menuId"
        aria-haspopup="menu"
        type="button"
        (click)="toggle()"
        (keydown)="onTriggerKeydown($event)">
        {{ label() }}
      </button>
      @if (isOpen()) {
        <div
          #menu
          class="ct-dropdown__menu"
          [id]="menuId"
          role="menu"
          aria-orientation="vertical"
          [attr.aria-labelledby]="triggerId"
          (keydown)="onMenuKeydown($event)">
          @for (item of items(); track $index) {
            @if (item.separator) {
              <div class="ct-dropdown__separator" role="separator"></div>
            } @else {
              <button
                #itemButton
                class="ct-dropdown__item"
                role="menuitem"
                [attr.tabindex]="focusedItemIndex() === getActionableIndex(item) ? 0 : -1"
                [attr.aria-disabled]="item.disabled ? 'true' : null"
                type="button"
                (click)="selectItem(item)">
                {{ item.label }}
              </button>
            }
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }
    `,
  ],
})
export class AfDropdownComponent {
  private static nextId = 0;
  private readonly hostRef = inject(ElementRef);

  /** Dropdown button label. */
  label = input('Actions');

  /** Trigger button size. */
  size = input<AfButtonSize>('md');

  /** Horizontal alignment of the menu relative to the trigger. */
  align = input<'start' | 'end'>('start');

  /** Which side of the trigger the menu opens on. */
  side = input<'bottom' | 'top'>('bottom');

  /** Menu items. */
  items = input<AfDropdownItem[]>([]);

  /** Emits the selected item's value. */
  itemSelected = output<unknown>();

  /** Computed CSS classes for the trigger button. */
  triggerClasses = computed(() => {
    const classes = ['ct-button', 'ct-button--secondary', 'ct-dropdown__trigger'];
    if (this.size() !== 'md') {
      classes.push(`ct-button--${this.size()}`);
    }
    return classes.join(' ');
  });

  triggerRef = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  menuRef = viewChild<ElementRef<HTMLElement>>('menu');
  itemButtons = viewChildren<ElementRef<HTMLButtonElement>>('itemButton');

  /** Non-separator items that can receive focus and be selected. */
  private actionableItems = computed(() => this.items().filter((item) => !item.separator));

  isOpen = signal(false);
  focusedItemIndex = signal(0);

  private instanceId = AfDropdownComponent.nextId++;
  menuId = `af-dropdown-menu-${this.instanceId}`;
  triggerId = `af-dropdown-trigger-${this.instanceId}`;

  private typeAheadBuffer = '';
  private typeAheadTimer: ReturnType<typeof setTimeout> | null = null;

  toggle(): void {
    if (this.isOpen()) {
      this.close(true);
    } else {
      this.open();
    }
  }

  selectItem(item: AfDropdownItem): void {
    if (!item.disabled) {
      this.itemSelected.emit(item.value);
      this.close(true);
    }
  }

  /** Handles keyboard events on the trigger button. */
  onTriggerKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!this.isOpen()) {
          this.open();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!this.isOpen()) {
          this.open(true);
        }
        break;
    }
  }

  /** Handles keyboard events within the open menu. */
  onMenuKeydown(event: KeyboardEvent): void {
    const actionableItems = this.actionableItems();
    if (actionableItems.length === 0) return;

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        const next = this.nextEnabledIndex(this.focusedItemIndex(), 1);
        this.focusItem(next);
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        const prev = this.nextEnabledIndex(this.focusedItemIndex(), -1);
        this.focusItem(prev);
        break;
      }
      case 'Home': {
        event.preventDefault();
        const first = this.nextEnabledIndex(-1, 1);
        this.focusItem(first);
        break;
      }
      case 'End': {
        event.preventDefault();
        const last = this.nextEnabledIndex(actionableItems.length, -1);
        this.focusItem(last);
        break;
      }
      case 'Escape':
        event.preventDefault();
        this.close(true);
        break;
      case 'Tab':
        this.close(false);
        break;
      case 'Enter':
      case ' ': {
        event.preventDefault();
        const item = actionableItems[this.focusedItemIndex()];
        if (item && !item.disabled) {
          this.selectItem(item);
        }
        break;
      }
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
          this.handleTypeAhead(event.key);
        }
    }
  }

  onDocumentClick(event: MouseEvent): void {
    if (!this.hostRef.nativeElement.contains(event.target)) {
      this.close(false);
    }
  }

  /**
   * Returns the index of a non-separator item within the list of
   * actionable (non-separator) items.
   */
  getActionableIndex(item: AfDropdownItem): number {
    return this.actionableItems().indexOf(item);
  }

  private open(focusLast = false): void {
    this.isOpen.set(true);
    const actionableItems = this.actionableItems();
    const startIndex = focusLast
      ? this.nextEnabledIndex(actionableItems.length, -1)
      : this.nextEnabledIndex(-1, 1);
    this.focusedItemIndex.set(startIndex);
    queueMicrotask(() => this.focusCurrent());
  }

  private close(returnFocus: boolean): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.typeAheadBuffer = '';
    if (returnFocus) {
      this.triggerRef()?.nativeElement.focus();
    }
  }

  private focusItem(index: number): void {
    this.focusedItemIndex.set(index);
    this.focusCurrent();
  }

  private focusCurrent(): void {
    const buttons = this.itemButtons();
    const idx = this.focusedItemIndex();
    buttons[idx]?.nativeElement.focus();
  }

  private nextEnabledIndex(from: number, direction: 1 | -1): number {
    const actionableItems = this.actionableItems();
    const len = actionableItems.length;
    if (len === 0) return 0;

    let idx = from + direction;
    for (let i = 0; i < len; i++) {
      if (idx < 0) idx = len - 1;
      if (idx >= len) idx = 0;
      if (!actionableItems[idx].disabled) return idx;
      idx += direction;
    }
    return from;
  }

  private handleTypeAhead(char: string): void {
    if (this.typeAheadTimer) {
      clearTimeout(this.typeAheadTimer);
    }
    this.typeAheadBuffer += char.toLowerCase();
    this.typeAheadTimer = setTimeout(() => {
      this.typeAheadBuffer = '';
      this.typeAheadTimer = null;
    }, 500);

    const actionableItems = this.actionableItems();
    const startIndex = this.focusedItemIndex() + 1;

    for (let i = 0; i < actionableItems.length; i++) {
      const idx = (startIndex + i) % actionableItems.length;
      const item = actionableItems[idx];
      if (!item.disabled && item.label.toLowerCase().startsWith(this.typeAheadBuffer)) {
        this.focusItem(idx);
        return;
      }
    }
  }
}

import { Component, ChangeDetectionStrategy, ElementRef, input, output, signal, viewChild, viewChildren } from '@angular/core';

export interface AfDropdownItem {
  label: string;
  value: unknown;
  disabled?: boolean;
  separator?: boolean;
}

/**
 * Dropdown menu component
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
    '(document:keydown.escape)': 'onEscape()',
  },
  template: `
    <div class="ct-dropdown" [attr.data-state]="isOpen() ? 'open' : 'closed'">
      <button
        #trigger
        class="ct-button ct-button--secondary ct-dropdown__trigger"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-controls]="menuId"
        [attr.aria-haspopup]="true"
        type="button"
        (click)="toggle()">
        {{ label() }}
      </button>
      @if (isOpen()) {
        <div class="ct-dropdown__menu" [id]="menuId">
          @for (item of items(); track $index) {
            @if (item.separator) {
              <div class="ct-dropdown__separator" role="separator"></div>
            } @else {
              <button
                #itemButton
                class="ct-dropdown__item"
                [disabled]="item.disabled"
                [attr.aria-disabled]="item.disabled ? true : null"
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
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class AfDropdownComponent {
  private static nextId = 0;

  /** Dropdown button label */
  label = input('Actions');

  /** Menu items */
  items = input<AfDropdownItem[]>([]);

  /** Item selected event */
  itemSelected = output<unknown>();

  triggerRef = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  itemButtons = viewChildren<ElementRef<HTMLButtonElement>>('itemButton');

  isOpen = signal(false);
  menuId = `af-dropdown-menu-${AfDropdownComponent.nextId++}`;

  toggle(): void {
    if (this.isOpen()) {
      this.close();
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

  private open(): void {
    this.isOpen.set(true);
    queueMicrotask(() => this.focusFirstItem());
  }

  private close(returnFocus = false): void {
    this.isOpen.set(false);
    if (returnFocus) {
      this.triggerRef()?.nativeElement.focus();
    }
  }

  private focusFirstItem(): void {
    const first = this.itemButtons().find(ref => !ref.nativeElement.disabled);
    first?.nativeElement.focus();
  }

  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.ct-dropdown')) {
      this.close();
    }
  }

  onEscape(): void {
    if (this.isOpen()) {
      this.close(true);
    }
  }
}

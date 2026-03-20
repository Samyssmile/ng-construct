import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  input,
  output,
  model,
  signal,
  computed,
  effect,
  viewChild,
  ElementRef,
} from '@angular/core';

export type AfDrawerPosition = 'right' | 'left' | 'top' | 'bottom';
export type AfDrawerSize = 'sm' | 'md' | 'lg' | 'full';

/**
 * Drawer/slide-out panel with full accessibility support.
 *
 * @example
 * ```html
 * <af-drawer [(open)]="isOpen" position="right" ariaLabel="Settings">
 *   <div header>
 *     <h2>Settings</h2>
 *   </div>
 *   <div body>
 *     <p>Drawer content here.</p>
 *   </div>
 *   <div footer>
 *     <button (click)="isOpen = false">Close</button>
 *   </div>
 * </af-drawer>
 * ```
 */
@Component({
  selector: 'af-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown)': 'onKeydown($event)',
  },
  template: `
    <div
      #drawer
      [class]="containerClasses()"
      [attr.data-state]="open() ? 'open' : 'closed'"
      role="dialog"
      [attr.aria-modal]="open() ? 'true' : null"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-labelledby]="!ariaLabel() ? titleId : null"
      (click)="onBackdropClick($event)">
      <div
        #panel
        class="ct-drawer__panel"
        tabindex="-1"
        (click)="$event.stopPropagation()">
        <div class="ct-drawer__header">
          <ng-content select="[header]"></ng-content>
          @if (showCloseButton()) {
            <button
              class="ct-button ct-button--ghost ct-button--icon ct-button--sm"
              type="button"
              [attr.aria-label]="closeButtonAriaLabel()"
              (click)="close()">
              <span class="ct-icon ct-icon--sm" aria-hidden="true">&times;</span>
            </button>
          }
        </div>
        <div class="ct-drawer__body">
          <ng-content select="[body]"></ng-content>
          <ng-content></ng-content>
        </div>
        <div class="ct-drawer__footer">
          <ng-content select="[footer]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export class AfDrawerComponent implements OnDestroy {
  private static nextId = 0;

  /** Two-way bindable open state */
  open = model(false);

  /** Slide-in position */
  position = input<AfDrawerPosition>('right');

  /** Panel size */
  size = input<AfDrawerSize>('md');

  /** Accessible label for the drawer dialog */
  ariaLabel = input('');

  /** Show built-in close button in the header */
  showCloseButton = input(true);

  /** Whether clicking the backdrop closes the drawer */
  closeOnBackdropClick = input(true);

  /** Aria label for the close button */
  closeButtonAriaLabel = input('Close drawer');

  /** Emits when the drawer requests to be closed */
  closed = output<void>();

  /** Unique ID for aria-labelledby fallback */
  readonly titleId = `af-drawer-title-${AfDrawerComponent.nextId++}`;

  private panelRef = viewChild<ElementRef<HTMLElement>>('panel');
  private previousActiveElement: HTMLElement | null = null;
  private focusableElements: HTMLElement[] = [];

  containerClasses = computed(() => {
    const classes = ['ct-drawer'];

    const pos = this.position();
    if (pos !== 'right') {
      classes.push(`ct-drawer--${pos}`);
    }

    const sz = this.size();
    if (sz !== 'md') {
      classes.push(`ct-drawer--${sz}`);
    }

    return classes.join(' ');
  });

  private openEffect = effect(() => {
    const isOpen = this.open();
    if (isOpen) {
      this.onOpen();
    } else {
      this.onClose();
    }
  });

  ngOnDestroy(): void {
    this.unlockBodyScroll();
    this.restoreFocus();
  }

  /** Closes the drawer and emits the closed event */
  close(): void {
    this.open.set(false);
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdropClick() && event.target === event.currentTarget) {
      this.close();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.open()) return;

    if (event.key === 'Escape') {
      this.close();
      return;
    }

    if (event.key === 'Tab') {
      this.trapFocus(event);
    }
  }

  private onOpen(): void {
    this.previousActiveElement = document.activeElement as HTMLElement;
    this.lockBodyScroll();
    queueMicrotask(() => {
      if (!this.open()) return;
      this.refreshFocusableElements();
      const first = this.focusableElements[0];
      if (first) {
        first.focus();
      } else {
        this.panelRef()?.nativeElement.focus();
      }
    });
  }

  private onClose(): void {
    this.unlockBodyScroll();
    this.restoreFocus();
  }

  private trapFocus(event: KeyboardEvent): void {
    this.refreshFocusableElements();
    if (this.focusableElements.length === 0) {
      event.preventDefault();
      this.panelRef()?.nativeElement.focus();
      return;
    }

    const first = this.focusableElements[0];
    const last = this.focusableElements[this.focusableElements.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private restoreFocus(): void {
    if (this.previousActiveElement) {
      this.previousActiveElement.focus();
      this.previousActiveElement = null;
    }
  }

  private lockBodyScroll(): void {
    document.body.style.overflow = 'hidden';
  }

  private unlockBodyScroll(): void {
    document.body.style.overflow = '';
  }

  private refreshFocusableElements(): void {
    const panel = this.panelRef()?.nativeElement;
    if (!panel) {
      this.focusableElements = [];
      return;
    }
    const selectors = [
      'a[href]',
      'area[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ];
    this.focusableElements = Array.from(
      panel.querySelectorAll<HTMLElement>(selectors.join(','))
    ).filter(
      (el) =>
        !el.hasAttribute('disabled') &&
        el.getAttribute('aria-hidden') !== 'true'
    );
  }
}

import { Component, ChangeDetectionStrategy, ContentChild, ElementRef, OnDestroy, AfterViewInit, input, output, signal, effect, viewChild } from '@angular/core';

/**
 * Modal/Dialog component with accessibility features
 *
 * @example
 * <af-modal
 *   [open]="isOpen"
 *   title="Confirm action"
 *   (closed)="handleClose()">
 *   <div body>
 *     <p>Are you sure?</p>
 *   </div>
 *   <div footer>
 *     <button (click)="cancel()">Cancel</button>
 *     <button (click)="confirm()">Confirm</button>
 *   </div>
 * </af-modal>
 */
@Component({
  selector: 'af-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscapeKey()',
    '(document:keydown)': 'onKeydown($event)',
  },
  template: `
    @if (open()) {
      <div
        class="ct-modal"
        [attr.data-state]="open() ? 'open' : 'closed'"
        role="dialog"
        [attr.aria-modal]="true"
        [attr.aria-labelledby]="titleId"
        (click)="onBackdropClick($event)">
          <div
            #dialog
            class="ct-modal__dialog"
            tabindex="-1"
            (click)="$event.stopPropagation()">
          <div class="ct-modal__header">
            <h2 [id]="titleId">{{ title() }}</h2>
            @if (showCloseButton()) {
              <button
                class="ct-button ct-button--ghost"
                aria-label="Close"
                (click)="close()">
                ×
              </button>
            }
          </div>
          <div class="ct-modal__body">
            <ng-content select="[body]"></ng-content>
            <ng-content></ng-content>
          </div>
          @if (hasFooter()) {
            <div class="ct-modal__footer">
              <ng-content select="[footer]"></ng-content>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: contents;
    }
  `]
})
export class AfModalComponent implements OnDestroy, AfterViewInit {
  private static nextId = 0;

  /** Whether modal is open */
  open = input(false);

  /** Modal title */
  title = input('');

  /** Whether to show close button */
  showCloseButton = input(true);

  /** Whether clicking backdrop closes modal */
  closeOnBackdropClick = input(true);

  /** Close event emitter */
  closed = output<void>();

  /** Unique title ID for aria-labelledby */
  titleId = `af-modal-title-${AfModalComponent.nextId++}`;

  hasFooter = signal(false);

  @ContentChild('[footer]', { read: ElementRef })
  set footerContent(value: ElementRef | undefined) {
    this.hasFooter.set(!!value);
  }

  private previousActiveElement: HTMLElement | null = null;
  private focusableElements: HTMLElement[] = [];
  private viewInitialized = signal(false);

  dialogRef = viewChild<ElementRef<HTMLElement>>('dialog');

  private openEffect = effect(() => {
    const isOpen = this.open();
    const initialized = this.viewInitialized();
    if (isOpen && initialized) {
      this.onOpen();
    } else if (!isOpen) {
      this.restoreFocus();
    }
  });

  ngAfterViewInit(): void {
    this.viewInitialized.set(true);
  }

  ngOnDestroy(): void {
    this.restoreFocus();
  }

  onEscapeKey(): void {
    if (this.open()) {
      this.close();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.open() || event.key !== 'Tab') return;

    this.refreshFocusableElements();
    if (this.focusableElements.length === 0) {
      event.preventDefault();
      this.dialogRef()?.nativeElement.focus();
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

  onBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdropClick() && event.target === event.currentTarget) {
      this.close();
    }
  }

  close(): void {
    this.closed.emit();
  }

  private onOpen(): void {
    this.previousActiveElement = document.activeElement as HTMLElement;
    this.refreshFocusableElements();
    queueMicrotask(() => {
      if (!this.open()) return;
      const first = this.focusableElements[0];
      if (first) {
        first.focus();
      } else {
        this.dialogRef()?.nativeElement.focus();
      }
    });
  }

  private restoreFocus(): void {
    if (this.previousActiveElement) {
      this.previousActiveElement.focus();
      this.previousActiveElement = null;
    }
  }

  private refreshFocusableElements(): void {
    const dialog = this.dialogRef()?.nativeElement;
    if (!dialog) {
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
      '[tabindex]:not([tabindex="-1"])'
    ];
    this.focusableElements = Array.from(dialog.querySelectorAll<HTMLElement>(selectors.join(',')))
      .filter(el => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');
  }
}

import { Component, ChangeDetectionStrategy, ElementRef, OnDestroy, AfterViewInit, input, output, signal, computed, effect, viewChild, contentChild } from '@angular/core';
import { FocusTrap } from '../../utils/focus-trap';

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
          <div class="ct-modal__footer" [hidden]="!hasFooter()">
            <ng-content select="[footer]"></ng-content>
          </div>
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
  private focusTrap = new FocusTrap();

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

  private footerRef = contentChild('[footer]', { read: ElementRef });
  hasFooter = computed(() => !!this.footerRef());

  private viewInitialized = signal(false);

  dialogRef = viewChild<ElementRef<HTMLElement>>('dialog');

  private openEffect = effect(() => {
    const isOpen = this.open();
    const initialized = this.viewInitialized();
    if (isOpen && initialized) {
      this.onOpen();
    } else if (!isOpen) {
      this.focusTrap.restoreFocus();
    }
  });

  ngAfterViewInit(): void {
    this.viewInitialized.set(true);
  }

  ngOnDestroy(): void {
    this.focusTrap.restoreFocus();
  }

  onEscapeKey(): void {
    if (this.open()) {
      this.close();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.open() || event.key !== 'Tab') return;
    this.focusTrap.handleTab(event, this.dialogRef()?.nativeElement, this.dialogRef()?.nativeElement);
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
    this.focusTrap.saveFocus();
    queueMicrotask(() => {
      if (!this.open()) return;
      this.focusTrap.focusFirst(this.dialogRef()?.nativeElement, this.dialogRef()?.nativeElement);
    });
  }
}

import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AfToastService, AfToast } from '../../services/toast.service';

/**
 * Toast notification container component
 * Place once in your app root template
 *
 * @example
 * <!-- app.component.html -->
 * <ct-toast-container></ct-toast-container>
 */
@Component({
  selector: 'af-toast-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ct-toast-region" aria-live="polite" aria-atomic="false">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="ct-toast"
          [attr.data-variant]="toast.variant"
          [attr.data-state]="'open'"
          role="status">
          <div class="ct-toast__title">{{ toast.title }}</div>
          @if (toast.description) {
            <div class="ct-toast__description">
              {{ toast.description }}
            </div>
          }
          @if (toast.action) {
            <button
              class="ct-button ct-button--ghost"
              (click)="handleAction(toast)">
              {{ toast.action.label }}
            </button>
          }
          <button
            class="ct-button ct-button--ghost"
            aria-label="Close"
            (click)="toastService.dismiss(toast.id)">
            ×
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: contents;
    }
  `]
})
export class AfToastContainerComponent {
  toastService = inject(AfToastService);

  handleAction(toast: AfToast): void {
    if (toast.action) {
      toast.action.callback();
      this.toastService.dismiss(toast.id);
    }
  }
}

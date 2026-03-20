import { Injectable, signal } from '@angular/core';

export type AfToastVariant = 'info' | 'success' | 'warning' | 'error';

export interface AfToast {
  id: string;
  title: string;
  description?: string;
  variant?: AfToastVariant;
  duration?: number;
  action?: {
    label: string;
    callback: () => void;
  };
}

/**
 * Toast notification service
 *
 * @example
 * const toast = inject(AfToastService);
 *
 * showSuccess() {
 *   this.toast.success('Saved', 'Your changes were saved successfully.');
 * }
 */
@Injectable({
  providedIn: 'root'
})
export class AfToastService {
  private toastsSignal = signal<AfToast[]>([]);
  private nextId = 0;

  /** Reactive signal for toast list */
  toasts = this.toastsSignal.asReadonly();

  /**
   * Show a toast notification
   */
  show(toast: Omit<AfToast, 'id'>): string {
    const id = `toast-${this.nextId++}`;
    const newToast: AfToast = {
      id,
      variant: 'info',
      duration: 5000,
      ...toast
    };

    this.toastsSignal.update(toasts => [...toasts, newToast]);

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => this.dismiss(id), newToast.duration);
    }

    return id;
  }

  /**
   * Show success toast
   */
  success(title: string, description?: string): string {
    return this.show({ title, description, variant: 'success' });
  }

  /**
   * Show error toast
   */
  error(title: string, description?: string): string {
    return this.show({ title, description, variant: 'error' });
  }

  /**
   * Show warning toast
   */
  warning(title: string, description?: string): string {
    return this.show({ title, description, variant: 'warning' });
  }

  /**
   * Show info toast
   */
  info(title: string, description?: string): string {
    return this.show({ title, description, variant: 'info' });
  }

  /**
   * Dismiss a toast by ID
   */
  dismiss(id: string): void {
    this.toastsSignal.update(toasts => toasts.filter(t => t.id !== id));
  }

  /**
   * Clear all toasts
   */
  clear(): void {
    this.toastsSignal.set([]);
  }
}

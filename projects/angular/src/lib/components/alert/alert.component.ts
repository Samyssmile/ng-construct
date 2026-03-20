import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
} from '@angular/core';

export type AfAlertVariant = 'info' | 'success' | 'warning' | 'danger';

/**
 * Alert component for displaying contextual feedback messages.
 *
 * Automatically assigns the appropriate ARIA role based on variant:
 * - `danger` / `warning` → `role="alert"` (assertive announcement)
 * - `info` / `success` → `role="status"` (polite announcement)
 *
 * @example
 * <af-alert variant="warning" [dismissible]="true" (dismissed)="onDismiss()">
 *   <span icon>⚠</span>
 *   <span title>Action required</span>
 *   Please review the pending changes before continuing.
 *   <div actions>
 *     <button class="ct-button ct-button--secondary ct-button--sm">Review</button>
 *   </div>
 * </af-alert>
 */
@Component({
  selector: 'af-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div
        [class]="alertClasses()"
        [attr.data-variant]="variant()"
        [attr.role]="alertRole()">
        <span class="ct-alert__icon" aria-hidden="true">
          <ng-content select="[icon]" />
        </span>
        <div class="ct-alert__content">
          <div class="ct-alert__title">
            <ng-content select="[title]" />
          </div>
          <div class="ct-alert__description">
            <ng-content />
          </div>
          <div class="ct-alert__actions">
            <ng-content select="[actions]" />
          </div>
        </div>
        @if (dismissible()) {
          <button
            type="button"
            class="af-alert__dismiss"
            aria-label="Dismiss alert"
            (click)="dismiss()">
            ×
          </button>
        }
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: contents;
      }

      .ct-alert--dismissible {
        position: relative;
        padding-right: 2.5rem;
      }

      .af-alert__dismiss {
        position: absolute;
        top: 0.625rem;
        right: 0.625rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.5rem;
        height: 1.5rem;
        padding: 0;
        border: none;
        background: none;
        border-radius: var(--radius-sm, 0.25rem);
        color: var(--color-text-secondary);
        font-size: 1.25rem;
        line-height: 1;
        cursor: pointer;
      }

      .af-alert__dismiss:hover {
        color: var(--color-text-primary);
      }

      .af-alert__dismiss:focus-visible {
        outline: 2px solid var(--ct-alert-accent, var(--color-brand-primary));
        outline-offset: 2px;
      }
    `,
  ],
})
export class AfAlertComponent {
  /** Color variant determining the alert's visual style and ARIA role */
  variant = input<AfAlertVariant>('info');

  /** Whether the alert can be dismissed by the user */
  dismissible = input(false);

  /** Emits when the user dismisses the alert */
  dismissed = output<void>();

  /** Controls alert visibility */
  visible = signal(true);

  alertClasses = computed(() => {
    const classes = ['ct-alert'];
    if (this.dismissible()) {
      classes.push('ct-alert--dismissible');
    }
    return classes.join(' ');
  });

  /**
   * Maps variant to ARIA role:
   * - danger/warning → 'alert' (assertive, immediate announcement)
   * - info/success → 'status' (polite, non-intrusive announcement)
   */
  alertRole = computed(() => {
    const v = this.variant();
    return v === 'danger' || v === 'warning' ? 'alert' : 'status';
  });

  /** Hides the alert and emits the dismissed event */
  dismiss(): void {
    this.visible.set(false);
    this.dismissed.emit();
  }
}

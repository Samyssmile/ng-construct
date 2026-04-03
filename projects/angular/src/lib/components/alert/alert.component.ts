import {
  Component,
  ChangeDetectionStrategy,
  InjectionToken,
  inject,
  input,
  output,
  signal,
  computed,
} from '@angular/core';

export type AfAlertVariant = 'info' | 'success' | 'warning' | 'danger';

/** Translatable strings used by the alert component. */
export interface AfAlertI18n {
  /** Label for the dismiss button (default: `'Dismiss alert'`). */
  dismiss: string;
  /** Screen-reader announcement when the alert is dismissed (default: `'Alert dismissed'`). */
  dismissed: string;
}

/**
 * Injection token to provide custom i18n strings for {@link AfAlertComponent}.
 *
 * @example
 * providers: [{ provide: AF_ALERT_I18N, useValue: { dismiss: 'Schliessen', dismissed: 'Warnung geschlossen' } }]
 */
export const AF_ALERT_I18N = new InjectionToken<AfAlertI18n>('AF_ALERT_I18N', {
  factory: () => ({ dismiss: 'Dismiss alert', dismissed: 'Alert dismissed' }),
});

/**
 * Alert component for displaying contextual feedback messages.
 *
 * Automatically assigns the appropriate ARIA role based on variant:
 * - `danger` / `warning` → `role="alert"` (assertive announcement)
 * - `info` / `success` → `role="status"` (polite announcement)
 *
 * ### Accessibility
 * - The dismiss button is keyboard-accessible via Tab, activated by Enter/Space (native `<button>`)
 * - When dismissed, a screen-reader announcement is made via an `aria-live="polite"` region
 * - The icon slot is marked `aria-hidden="true"` to prevent redundant announcements
 * - The `aria-label` on the dismiss button is configurable via {@link AF_ALERT_I18N} for i18n
 * - Supports `forced-colors` (Windows High Contrast) mode
 * - Uses CSS logical properties for RTL layout support
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
            [attr.aria-label]="i18n.dismiss"
            (click)="dismiss()">
            <span class="ct-icon ct-icon--sm" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span>
          </button>
        }
      </div>
    }
    <span class="af-alert__sr-only" aria-live="polite" aria-atomic="true">
      {{ liveAnnouncement() }}
    </span>
  `,
  styles: [
    `
      :host {
        display: contents;
      }

      .ct-alert--dismissible {
        position: relative;
        padding-inline-end: 2.5rem;
      }

      .af-alert__dismiss {
        position: absolute;
        inset-block-start: 0.625rem;
        inset-inline-end: 0.625rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.5rem;
        height: 1.5rem;
        min-width: 24px;
        min-height: 24px;
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

      @media (forced-colors: active) {
        .af-alert__dismiss {
          border: 1px solid ButtonText;
        }

        .af-alert__dismiss:focus-visible {
          outline-color: Highlight;
        }
      }

      .af-alert__sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    `,
  ],
})
export class AfAlertComponent {
  protected readonly i18n = inject(AF_ALERT_I18N);

  /** Color variant determining the alert's visual style and ARIA role. */
  variant = input<AfAlertVariant>('info');

  /** Whether the alert can be dismissed by the user. */
  dismissible = input(false);

  /** Emits when the user dismisses the alert. */
  dismissed = output<void>();

  /** Controls alert visibility. */
  visible = signal(true);

  /** @internal Screen-reader announcement text. */
  liveAnnouncement = signal('');

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

  /** Hides the alert and emits the dismissed event. */
  dismiss(): void {
    this.visible.set(false);
    this.dismissed.emit();
    this.liveAnnouncement.set('');
    setTimeout(() => this.liveAnnouncement.set(this.i18n.dismissed));
  }
}

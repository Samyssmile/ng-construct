import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  input,
  output,
  signal,
  computed,
  effect,
} from '@angular/core';

/** Semantic variants controlling colors and ARIA behavior */
export type AfBannerVariant = 'info' | 'warning' | 'danger' | 'success' | 'neutral';

/** Visual appearance styles */
export type AfBannerAppearance = 'subtle' | 'solid' | 'left-accent' | 'top-accent';

/** Positioning strategies */
export type AfBannerPosition = 'inline' | 'fixed-top' | 'fixed-bottom' | 'sticky';

/**
 * Persistent page- or section-level notice component.
 * Wraps the `ct-banner` design system component with dismiss logic,
 * optional auto-close timer, and ARIA live region support.
 *
 * Uses attribute-based content projection for icon, heading, message,
 * and actions slots. The component automatically applies the correct
 * `ct-banner__*` CSS wrapper classes.
 *
 * @example
 * ```html
 * <af-banner variant="warning" [dismissible]="true" (dismissed)="onDismissed()">
 *   <span icon>⚠️</span>
 *   <span heading>Attention</span>
 *   <span message>Something needs your attention.</span>
 *   <div actions>
 *     <button class="ct-button ct-button--sm">Fix now</button>
 *   </div>
 * </af-banner>
 * ```
 */
@Component({
  selector: 'af-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [class]="hostClasses()"
      [attr.data-variant]="variant()"
      [attr.data-state]="state()"
      [attr.role]="ariaRole()">
      <div class="ct-banner__icon">
        <ng-content select="[icon]" />
      </div>
      <div class="ct-banner__content">
        <div class="ct-banner__title">
          <ng-content select="[heading]" />
        </div>
        <div class="ct-banner__message">
          <ng-content select="[message]" />
        </div>
        <ng-content />
      </div>
      <div class="ct-banner__actions">
        <ng-content select="[actions]" />
      </div>
      @if (dismissible()) {
        <button
          class="ct-banner__close"
          type="button"
          [attr.aria-label]="closeAriaLabel()"
          (click)="dismiss()">
          &times;
        </button>
      }
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
export class AfBannerComponent implements OnDestroy {
  /** Semantic variant controlling colors and ARIA role */
  variant = input<AfBannerVariant>('info');

  /** Visual appearance style */
  appearance = input<AfBannerAppearance>('subtle');

  /** Positioning strategy */
  position = input<AfBannerPosition>('inline');

  /** Whether the banner displays a close/dismiss button */
  dismissible = input(false);

  /** Compact size mode */
  compact = input(false);

  /** Full-width layout (no radius, no inline border) */
  full = input(false);

  /** Auto-close delay in milliseconds. 0 means no auto-close */
  autoClose = input(0);

  /** Aria label for the close button */
  closeAriaLabel = input('Close banner');

  /** Emits when the banner is dismissed (by user or auto-close) */
  dismissed = output<void>();

  private readonly isDismissed = signal(false);
  private autoCloseTimerId: ReturnType<typeof setTimeout> | null = null;

  /** Current open/closed state for the data-state attribute */
  state = computed(() => (this.isDismissed() ? 'closed' : 'open'));

  /** ARIA role based on variant: alert for danger/warning, status for others */
  ariaRole = computed(() => {
    const v = this.variant();
    return v === 'danger' || v === 'warning' ? 'alert' : 'status';
  });

  /** Computed CSS class string for the banner element */
  hostClasses = computed(() => {
    const classes = ['ct-banner'];

    const app = this.appearance();
    if (app !== 'subtle') {
      classes.push(`ct-banner--${app}`);
    }

    const pos = this.position();
    if (pos !== 'inline') {
      classes.push(`ct-banner--${pos}`);
    }

    if (this.compact()) {
      classes.push('ct-banner--compact');
    }

    if (this.full()) {
      classes.push('ct-banner--full');
    }

    return classes.join(' ');
  });

  private autoCloseEffect = effect(() => {
    const delay = this.autoClose();
    this.clearAutoCloseTimer();
    if (delay > 0 && !this.isDismissed()) {
      this.autoCloseTimerId = setTimeout(() => this.dismiss(), delay);
    }
  });

  ngOnDestroy(): void {
    this.clearAutoCloseTimer();
  }

  /** Dismisses the banner and emits the dismissed event */
  dismiss(): void {
    if (this.isDismissed()) return;
    this.isDismissed.set(true);
    this.clearAutoCloseTimer();
    this.dismissed.emit();
  }

  private clearAutoCloseTimer(): void {
    if (this.autoCloseTimerId !== null) {
      clearTimeout(this.autoCloseTimerId);
      this.autoCloseTimerId = null;
    }
  }
}

import { DOCUMENT } from '@angular/common';
import { inject, Injectable, OnDestroy } from '@angular/core';

/**
 * Lightweight service that announces messages to screen readers
 * via an `aria-live` region. No `@angular/cdk` dependency required.
 *
 * @example
 * private announcer = inject(AriaLiveAnnouncer);
 * this.announcer.announce('Section expanded');
 */
@Injectable({ providedIn: 'root' })
export class AriaLiveAnnouncer implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  private liveEl: HTMLElement | null = null;
  private clearTimer: ReturnType<typeof setTimeout> | null = null;

  /** Announce a message to screen readers. */
  announce(message: string, politeness: 'polite' | 'assertive' = 'polite'): void {
    const el = this.getOrCreateLiveElement();
    el.setAttribute('aria-live', politeness);

    // Clear then re-set so assistive tech registers the change.
    el.textContent = '';

    if (this.clearTimer) {
      clearTimeout(this.clearTimer);
    }

    // Small delay so the DOM mutation is picked up as a new announcement.
    setTimeout(() => {
      el.textContent = message;
    }, 50);

    // Auto-clear after 3 seconds to avoid stale text.
    this.clearTimer = setTimeout(() => {
      el.textContent = '';
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.clearTimer) {
      clearTimeout(this.clearTimer);
    }
    this.liveEl?.remove();
    this.liveEl = null;
  }

  private getOrCreateLiveElement(): HTMLElement {
    if (this.liveEl) return this.liveEl;

    const el = this.document.createElement('div');
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-atomic', 'true');
    el.classList.add('cdk-visually-hidden');

    // Visually hidden but accessible to screen readers.
    Object.assign(el.style, {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: '0',
    });

    this.document.body.appendChild(el);
    this.liveEl = el;
    return el;
  }
}

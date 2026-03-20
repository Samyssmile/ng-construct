import {
  Component,
  ChangeDetectionStrategy,
  input,
  inject,
  ElementRef,
  DOCUMENT,
} from '@angular/core';

/**
 * Skip-link component for keyboard-only navigation bypass.
 *
 * Renders an anchor that is visually hidden off-screen and slides into view
 * when focused. On activation it moves focus to the target element, allowing
 * keyboard users to skip repetitive navigation blocks.
 *
 * Must be placed as the first focusable element in the document.
 *
 * @example
 * <af-skip-link target="main-content" />
 * <nav>…</nav>
 * <main id="main-content" tabindex="-1">…</main>
 */
@Component({
  selector: 'af-skip-link',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      class="ct-skip-link"
      [attr.href]="'#' + target()"
      (click)="focusTarget($event)"
    >
      {{ label() }}
    </a>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export class AfSkipLinkComponent {
  /** ID of the element to skip to (without the leading `#`). */
  target = input.required<string>();

  /** Visible label text shown when the link receives focus. */
  label = input('Skip to main content');

  private readonly document = inject(DOCUMENT);

  /**
   * Moves focus to the target element so keyboard navigation
   * continues from there instead of the top of the page.
   */
  focusTarget(event: Event): void {
    event.preventDefault();

    const el = this.document.getElementById(this.target());
    if (!el) {
      return;
    }

    if (!el.hasAttribute('tabindex')) {
      el.setAttribute('tabindex', '-1');
    }
    el.focus();
  }
}

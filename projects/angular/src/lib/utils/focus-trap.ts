const FOCUSABLE_SELECTORS = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Manages focus trapping within a container element.
 *
 * Handles Tab/Shift+Tab cycling, save/restore of the previously focused
 * element, and initial focus placement. Create one instance per overlay
 * (modal, drawer, popover, etc.).
 */
export class FocusTrap {
  private previousActiveElement: HTMLElement | null = null;

  /** Saves the currently focused element for later restoration. */
  saveFocus(): void {
    this.previousActiveElement = document.activeElement as HTMLElement;
  }

  /** Restores focus to the element saved via `saveFocus()`. */
  restoreFocus(): void {
    if (this.previousActiveElement) {
      this.previousActiveElement.focus();
      this.previousActiveElement = null;
    }
  }

  /** Overrides the saved focus target (e.g. to return focus to a specific trigger). */
  setReturnFocus(element: HTMLElement): void {
    this.previousActiveElement = element;
  }

  /**
   * Focuses the first focusable element inside the container,
   * or the fallback element if no focusable children exist.
   */
  focusFirst(container: HTMLElement | null | undefined, fallback?: HTMLElement | null): void {
    const elements = queryFocusableElements(container);
    const first = elements[0];
    if (first) {
      first.focus();
    } else {
      fallback?.focus();
    }
  }

  /**
   * Handles a Tab keydown event to trap focus within the container.
   * Call this from a `(keydown)` handler when the key is `Tab`.
   */
  handleTab(
    event: KeyboardEvent,
    container: HTMLElement | null | undefined,
    fallback?: HTMLElement | null,
  ): void {
    const elements = queryFocusableElements(container);

    if (elements.length === 0) {
      event.preventDefault();
      fallback?.focus();
      return;
    }

    const first = elements[0];
    const last = elements[elements.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }
}

/** Queries all visible, enabled, focusable elements within a container. */
function queryFocusableElements(container: HTMLElement | null | undefined): HTMLElement[] {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS),
  ).filter(
    (el) =>
      !el.hasAttribute('disabled') &&
      el.getAttribute('aria-hidden') !== 'true',
  );
}

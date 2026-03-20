import {
  Directive,
  ElementRef,
  Renderer2,
  OnDestroy,
  effect,
  input,
  inject,
} from '@angular/core';

export type AfTooltipPosition = 'top' | 'bottom' | 'left' | 'right';

let tooltipIdCounter = 0;

/**
 * Directive that attaches a tooltip to any host element.
 *
 * Uses the design system's `ct-tooltip` CSS classes for styling and animation.
 * Shows on hover and focus, hides on blur, mouse leave, and Escape key.
 * Includes a configurable delay before showing.
 *
 * @example
 * <button afTooltip="Save changes">Save</button>
 *
 * @example
 * <button
 *   afTooltip="Delete item"
 *   afTooltipPosition="bottom"
 *   [afTooltipDelay]="500">
 *   Delete
 * </button>
 */
@Directive({
  selector: '[afTooltip]',
})
export class AfTooltipDirective implements OnDestroy {
  /** Tooltip text content */
  text = input('', { alias: 'afTooltip' });

  /** Position relative to the host element */
  afTooltipPosition = input<AfTooltipPosition>('top');

  /** Delay in ms before showing the tooltip */
  afTooltipDelay = input(300);

  /** Whether the tooltip is disabled */
  afTooltipDisabled = input(false);

  private el = inject(ElementRef<HTMLElement>);
  private renderer = inject(Renderer2);

  private contentEl: HTMLElement | null = null;
  private tooltipId = `af-tooltip-${tooltipIdCounter++}`;
  private showTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly listeners: (() => void)[] = [];

  constructor() {
    this.initHost();
    this.setupListeners();
  }

  private textEffect = effect(() => {
    if (this.contentEl) {
      this.contentEl.textContent = this.text();
    }
  });

  private positionEffect = effect(() => {
    this.el.nativeElement.setAttribute('data-side', this.afTooltipPosition());
  });

  ngOnDestroy(): void {
    this.hide();
    this.listeners.forEach(unlisten => unlisten());
  }

  private initHost(): void {
    const host = this.el.nativeElement;
    this.renderer.addClass(host, 'ct-tooltip');
    host.setAttribute('data-state', 'closed');
    host.setAttribute('data-side', this.afTooltipPosition());
  }

  private setupListeners(): void {
    const host = this.el.nativeElement;

    this.listeners.push(
      this.renderer.listen(host, 'mouseenter', () => this.scheduleShow()),
      this.renderer.listen(host, 'mouseleave', () => this.hide()),
      this.renderer.listen(host, 'focusin', () => this.scheduleShow()),
      this.renderer.listen(host, 'focusout', () => this.hide()),
      this.renderer.listen(host, 'keydown', (e: KeyboardEvent) => {
        if (e.key === 'Escape') this.hide();
      }),
    );
  }

  private scheduleShow(): void {
    if (this.afTooltipDisabled() || !this.text()) return;
    this.clearTimeout();
    this.showTimeout = setTimeout(() => this.show(), this.afTooltipDelay());
  }

  private show(): void {
    if (this.contentEl) return;

    const host = this.el.nativeElement;
    const content = this.renderer.createElement('span') as HTMLElement;
    content.classList.add('ct-tooltip__content');
    content.setAttribute('role', 'tooltip');
    content.setAttribute('id', this.tooltipId);
    content.textContent = this.text();

    this.renderer.appendChild(host, content);
    host.setAttribute('aria-describedby', this.tooltipId);
    this.contentEl = content;

    // Trigger open state on next frame so CSS transition plays
    requestAnimationFrame(() => {
      host.setAttribute('data-state', 'open');
    });
  }

  private hide(): void {
    this.clearTimeout();
    if (this.contentEl) {
      const host = this.el.nativeElement;
      host.setAttribute('data-state', 'closed');
      host.removeAttribute('aria-describedby');
      this.contentEl.remove();
      this.contentEl = null;
    }
  }

  private clearTimeout(): void {
    if (this.showTimeout !== null) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }
  }
}

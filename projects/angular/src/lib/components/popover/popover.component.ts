import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  InjectionToken,
  OnDestroy,
  Signal,
  computed,
  contentChild,
  effect,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FocusTrap } from '../../utils/focus-trap';

export type AfPopoverPosition = 'top' | 'bottom' | 'left' | 'right';
export type AfPopoverAlign = 'start' | 'center' | 'end';
export type AfPopoverSize = 'sm' | 'md' | 'lg';

/** @internal API surface exposed to the trigger directive. */
interface AfPopoverApi {
  toggle(): void;
  open: Signal<boolean>;
  contentId: string;
}

/** @internal */
const AF_POPOVER = new InjectionToken<AfPopoverApi>('AfPopover');

/**
 * Marks the trigger element for an `af-popover`.
 * Automatically sets ARIA attributes and toggles on click.
 *
 * @example
 * ```html
 * <af-popover>
 *   <button afPopoverTrigger>Open</button>
 *   ...
 * </af-popover>
 * ```
 */
@Directive({
  selector: '[afPopoverTrigger]',
  host: {
    '(click)': 'popover.toggle()',
    '[attr.aria-haspopup]': '"dialog"',
    '[attr.aria-expanded]': 'popover.open()',
    '[attr.aria-controls]': 'popover.contentId',
  },
})
export class AfPopoverTriggerDirective {
  /** @internal */
  readonly popover = inject(AF_POPOVER);
  /** @internal */
  readonly elementRef = inject(ElementRef<HTMLElement>);
}

/**
 * Popover with configurable positioning, auto-flip, focus management,
 * and full ARIA support.
 *
 * @example
 * ```html
 * <af-popover position="bottom" align="center" title="Info">
 *   <button afPopoverTrigger>More info</button>
 *   <p>Some helpful content.</p>
 * </af-popover>
 * ```
 */
@Component({
  selector: 'af-popover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: AF_POPOVER, useExisting: forwardRef(() => AfPopoverComponent) },
  ],
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'onEscapeKey()',
    '(document:keydown)': 'onKeydown($event)',
  },
  template: `
    <div
      #wrapper
      [class]="containerClasses()"
      [attr.data-state]="open() ? 'open' : 'closed'"
      [attr.data-side]="activeSide()"
      [attr.data-align]="align()">
      <ng-content select="[afPopoverTrigger]"></ng-content>
      <div
        #popoverContent
        class="ct-popover__content"
        role="dialog"
        [id]="contentId"
        [attr.aria-label]="ariaLabel() || null"
        [attr.aria-labelledby]="!ariaLabel() && title() ? headerId : null"
        tabindex="-1">
        @if (showArrow()) {
          <div class="ct-popover__arrow"></div>
        }
        @if (title()) {
          <div class="ct-popover__header">
            <h3 [id]="headerId">{{ title() }}</h3>
          </div>
        }
        <div class="ct-popover__body">
          <ng-content select="[body]"></ng-content>
          <ng-content></ng-content>
        </div>
      </div>
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
export class AfPopoverComponent implements AfPopoverApi, OnDestroy {
  private static nextId = 0;
  private focusTrap = new FocusTrap();

  /** Two-way bindable open state. */
  open = model(false);

  /** Preferred position relative to the trigger. Flips automatically when space is insufficient. */
  position = input<AfPopoverPosition>('bottom');

  /** Alignment along the position axis. */
  align = input<AfPopoverAlign>('center');

  /** Size variant (`sm` = 240px, `md` = default, `lg` = 480px). */
  size = input<AfPopoverSize>('md');

  /** Title displayed in the header section. */
  title = input('');

  /** Accessible label (overrides `aria-labelledby` from title). */
  ariaLabel = input('');

  /** Whether to show the decorative arrow. */
  showArrow = input(true);

  /** Whether clicking outside closes the popover. */
  closeOnClickOutside = input(true);

  /** Emits when the popover closes. */
  closed = output<void>();

  readonly contentId = `af-popover-${AfPopoverComponent.nextId}`;
  readonly headerId = `af-popover-header-${AfPopoverComponent.nextId++}`;

  private wrapperRef = viewChild<ElementRef<HTMLElement>>('wrapper');
  private contentRef = viewChild<ElementRef<HTMLElement>>('popoverContent');
  private triggerDirective = contentChild(AfPopoverTriggerDirective);
  private flippedSide = signal<AfPopoverPosition | null>(null);

  /** Effective side after auto-flip evaluation. */
  activeSide = computed(() => this.flippedSide() ?? this.position());

  containerClasses = computed(() => {
    const classes = ['ct-popover'];
    const sz = this.size();
    if (sz !== 'md') {
      classes.push(`ct-popover--${sz}`);
    }
    return classes.join(' ');
  });

  private openEffect = effect(() => {
    if (this.open()) {
      this.onOpen();
    } else {
      this.onClose();
    }
  });

  ngOnDestroy(): void {
    this.focusTrap.restoreFocus();
  }

  /** Toggle the popover open state. */
  toggle(): void {
    if (this.open()) {
      this.close();
    } else {
      this.open.set(true);
    }
  }

  /** Close the popover and emit the `closed` event. */
  close(): void {
    this.open.set(false);
    this.closed.emit();
  }

  onDocumentClick(event: MouseEvent): void {
    if (!this.open() || !this.closeOnClickOutside()) return;
    const wrapper = this.wrapperRef()?.nativeElement;
    if (wrapper && !wrapper.contains(event.target as Node)) {
      this.close();
    }
  }

  onEscapeKey(): void {
    if (!this.open()) return;
    const trigger = this.triggerDirective()?.elementRef.nativeElement;
    if (trigger) {
      this.focusTrap.setReturnFocus(trigger);
    }
    this.close();
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.open() || event.key !== 'Tab') return;
    const content = this.contentRef()?.nativeElement;
    this.focusTrap.handleTab(event, content, content);
  }

  private onOpen(): void {
    this.focusTrap.saveFocus();
    this.flippedSide.set(this.computeFlippedSide());
    queueMicrotask(() => {
      if (!this.open()) return;
      const content = this.contentRef()?.nativeElement;
      this.focusTrap.focusFirst(content, content);
    });
  }

  private onClose(): void {
    this.flippedSide.set(null);
    this.focusTrap.restoreFocus();
  }

  private computeFlippedSide(): AfPopoverPosition {
    const trigger = this.triggerDirective()?.elementRef.nativeElement;
    const content = this.contentRef()?.nativeElement;
    if (!trigger || !content) return this.position();

    const triggerRect = trigger.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();
    const preferred = this.position();

    const opposites: Record<AfPopoverPosition, AfPopoverPosition> = {
      top: 'bottom',
      bottom: 'top',
      left: 'right',
      right: 'left',
    };

    const space: Record<AfPopoverPosition, number> = {
      top: triggerRect.top,
      bottom: window.innerHeight - triggerRect.bottom,
      left: triggerRect.left,
      right: window.innerWidth - triggerRect.right,
    };

    const needed: Record<AfPopoverPosition, number> = {
      top: contentRect.height,
      bottom: contentRect.height,
      left: contentRect.width,
      right: contentRect.width,
    };

    if (space[preferred] >= needed[preferred]) return preferred;

    const opposite = opposites[preferred];
    if (space[opposite] >= needed[opposite]) return opposite;

    return preferred;
  }
}

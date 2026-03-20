import {
  Component,
  ChangeDetectionStrategy,
  booleanAttribute,
  input,
  model,
  computed,
  contentChildren,
  effect,
  ElementRef,
  viewChild,
  inject,
  forwardRef,
} from '@angular/core';

let nextId = 0;

/**
 * Individual accordion item used within af-accordion.
 *
 * @example
 * <af-accordion-item heading="Section Title">
 *   <p>Content goes here</p>
 * </af-accordion-item>
 */
@Component({
  selector: 'af-accordion-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <details
      #details
      class="ct-accordion__item"
      [open]="expanded()"
      (toggle)="onToggle($event)">
      <summary
        class="ct-accordion__trigger"
        [attr.id]="triggerId()"
        [attr.aria-expanded]="expanded()"
        [attr.aria-controls]="panelId()"
        [attr.aria-disabled]="disabled() || null"
        (click)="onClick($event)">
        <span class="ct-accordion__heading">{{ heading() }}</span>
        <svg
          class="ct-accordion__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          focusable="false">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </summary>
      <div
        class="ct-accordion__content"
        role="region"
        [attr.id]="panelId()"
        [attr.aria-labelledby]="triggerId()">
        <ng-content></ng-content>
      </div>
    </details>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class AfAccordionItemComponent {
  private itemId = nextId++;
  private accordion = inject(forwardRef(() => AfAccordionComponent), { optional: true });

  /** Heading text displayed in the accordion trigger. */
  heading = input.required<string>();

  /** Whether this item is expanded (supports two-way binding). */
  expanded = model(false);

  /** Whether this item is disabled. */
  disabled = input(false, { transform: booleanAttribute });

  detailsRef = viewChild.required<ElementRef<HTMLDetailsElement>>('details');

  triggerId = computed(() => `af-accordion-trigger-${this.itemId}`);
  panelId = computed(() => `af-accordion-panel-${this.itemId}`);

  /** Sync signal when the native details state diverges (e.g. programmatic open). */
  onToggle(event: Event): void {
    const details = event.target as HTMLDetailsElement;
    if (details.open !== this.expanded()) {
      this.expanded.set(details.open);
      if (details.open) {
        this.accordion?.onItemExpanded(this);
      }
    }
  }

  /**
   * Prevent native details toggle and manage state via signals
   * so the expanded signal is always the source of truth.
   */
  onClick(event: MouseEvent): void {
    event.preventDefault();
    if (this.disabled()) return;
    const willExpand = !this.expanded();
    this.expanded.set(willExpand);
    if (willExpand) {
      this.accordion?.onItemExpanded(this);
    }
  }

  /** Programmatically collapse this item. */
  collapse(): void {
    this.expanded.set(false);
  }

  /** Focus the trigger (summary) element. */
  focusTrigger(): void {
    this.detailsRef().nativeElement.querySelector('summary')?.focus();
  }
}

/**
 * Accordion container that manages expand/collapse behaviour of child items.
 *
 * @example
 * <af-accordion>
 *   <af-accordion-item heading="Section 1">Content 1</af-accordion-item>
 *   <af-accordion-item heading="Section 2">Content 2</af-accordion-item>
 * </af-accordion>
 *
 * @example Single-expand mode
 * <af-accordion [multi]="false">
 *   <af-accordion-item heading="Only one open">Content</af-accordion-item>
 * </af-accordion>
 */
@Component({
  selector: 'af-accordion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(keydown)': 'handleKeydown($event)',
  },
  template: `
    <div [class]="accordionClasses()">
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class AfAccordionComponent {
  /** Allow multiple items to be open at the same time (default: true). */
  multi = input(true, { transform: booleanAttribute });

  /** Use the bordered variant. */
  bordered = input(false, { transform: booleanAttribute });

  items = contentChildren(AfAccordionItemComponent);

  accordionClasses = computed(() => {
    const classes = ['ct-accordion'];
    if (this.bordered()) {
      classes.push('ct-accordion--bordered');
    }
    return classes.join(' ');
  });

  /**
   * Enforce single-expand constraint when `multi` is false
   * and multiple items are initially expanded.
   */
  private enforceConstraint = effect(() => {
    if (this.multi()) return;
    const expanded = this.items().filter((i) => i.expanded());
    if (expanded.length > 1) {
      for (let i = 1; i < expanded.length; i++) {
        expanded[i].collapse();
      }
    }
  });

  /** Called by child items when they expand. */
  onItemExpanded(expandedItem: AfAccordionItemComponent): void {
    if (this.multi()) return;
    for (const item of this.items()) {
      if (item !== expandedItem && item.expanded()) {
        item.collapse();
      }
    }
  }

  handleKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (target.tagName !== 'SUMMARY') return;

    const enabledItems = this.items().filter((i) => !i.disabled());
    if (enabledItems.length === 0) return;

    const currentIndex = enabledItems.findIndex(
      (item) => item.detailsRef().nativeElement.querySelector('summary') === target,
    );
    if (currentIndex === -1) return;

    const last = enabledItems.length - 1;

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        enabledItems[(currentIndex + 1) % enabledItems.length].focusTrigger();
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        enabledItems[(currentIndex - 1 + enabledItems.length) % enabledItems.length].focusTrigger();
        break;
      }
      case 'Home': {
        event.preventDefault();
        enabledItems[0].focusTrigger();
        break;
      }
      case 'End': {
        event.preventDefault();
        enabledItems[last].focusTrigger();
        break;
      }
    }
  }
}

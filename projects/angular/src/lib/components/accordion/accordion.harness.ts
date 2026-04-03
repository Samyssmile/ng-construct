/**
 * Test harness for AfAccordionItemComponent.
 *
 * Provides a semantic API for interacting with a single accordion item,
 * abstracting DOM details behind readable method names.
 */
export class AfAccordionItemHarness {
  constructor(private readonly hostEl: HTMLElement) {}

  /** Returns the heading text. */
  getHeading(): string {
    const heading = this.hostEl.querySelector('.ct-accordion__heading');
    return heading?.textContent?.trim() ?? '';
  }

  /** Returns whether the item is expanded. */
  isExpanded(): boolean {
    return this.getTriggerElement().getAttribute('aria-expanded') === 'true';
  }

  /** Returns whether the item is disabled. */
  isDisabled(): boolean {
    return this.getTriggerElement().getAttribute('aria-disabled') === 'true';
  }

  /** Clicks the trigger to toggle the item. */
  toggle(): void {
    this.getTriggerElement().click();
  }

  /** Returns the trigger (summary) element. */
  getTriggerElement(): HTMLElement {
    const summary = this.hostEl.querySelector('summary');
    if (!summary) {
      throw new Error('AfAccordionItemHarness: <summary> element not found.');
    }
    return summary;
  }

  /** Returns the content panel element. */
  getContentElement(): HTMLElement {
    const panel = this.hostEl.querySelector('[role="region"]');
    if (!panel) {
      throw new Error('AfAccordionItemHarness: content region not found.');
    }
    return panel as HTMLElement;
  }

  /** Returns the `aria-controls` value of the trigger. */
  getAriaControls(): string | null {
    return this.getTriggerElement().getAttribute('aria-controls');
  }

  /** Returns the `aria-expanded` value of the trigger. */
  getAriaExpanded(): string | null {
    return this.getTriggerElement().getAttribute('aria-expanded');
  }
}

/**
 * Test harness for AfAccordionComponent.
 *
 * @example
 * const harness = new AfAccordionHarness(fixture.nativeElement);
 * expect(harness.getItems()).toHaveLength(3);
 * harness.getItem(0).toggle();
 */
export class AfAccordionHarness {
  private readonly hostEl: HTMLElement;

  constructor(container: HTMLElement) {
    const el = container.querySelector('af-accordion');
    if (!el) {
      throw new Error('AfAccordionHarness: af-accordion element not found in container.');
    }
    this.hostEl = el as HTMLElement;
  }

  /** Returns harnesses for all accordion items. */
  getItems(): AfAccordionItemHarness[] {
    const items = Array.from(this.hostEl.querySelectorAll('af-accordion-item'));
    return items.map((el) => new AfAccordionItemHarness(el as HTMLElement));
  }

  /** Returns the harness for the accordion item at the given index. */
  getItem(index: number): AfAccordionItemHarness {
    const items = this.getItems();
    if (index < 0 || index >= items.length) {
      throw new Error(
        `AfAccordionHarness: index ${index} out of range (${items.length} items).`,
      );
    }
    return items[index];
  }

  /** Returns whether the bordered variant is applied. */
  isBordered(): boolean {
    const wrapper = this.hostEl.querySelector('.ct-accordion');
    return wrapper?.classList.contains('ct-accordion--bordered') ?? false;
  }
}

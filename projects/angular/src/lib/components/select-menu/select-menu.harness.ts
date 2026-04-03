/**
 * Test harness for AfSelectMenuComponent.
 *
 * Provides a semantic API for interacting with the select-menu in tests,
 * abstracting DOM details behind readable method names.
 *
 * @example
 * const harness = new AfSelectMenuHarness(fixture.nativeElement);
 * harness.click();
 * expect(harness.isOpen()).toBe(true);
 * expect(harness.getOptionCount()).toBe(4);
 * harness.clickOption(1);
 * expect(harness.getTriggerText()).toBe('Banana');
 */
export class AfSelectMenuHarness {
  private readonly hostEl: HTMLElement;

  constructor(container: HTMLElement) {
    const el = container.querySelector('af-select-menu');
    if (!el) {
      throw new Error('AfSelectMenuHarness: af-select-menu element not found in container.');
    }
    this.hostEl = el as HTMLElement;
  }

  /** Returns the trigger `<button>` element. */
  getTriggerElement(): HTMLButtonElement {
    const btn = this.hostEl.querySelector('.ct-select-menu__trigger');
    if (!btn) {
      throw new Error('AfSelectMenuHarness: trigger button not found.');
    }
    return btn as HTMLButtonElement;
  }

  /** Returns the trimmed display text of the trigger. */
  getTriggerText(): string {
    const value = this.hostEl.querySelector('.ct-select-menu__value');
    return value?.textContent?.trim() ?? '';
  }

  /** Clicks the trigger button. */
  click(): void {
    this.getTriggerElement().click();
  }

  /** Returns whether the trigger is disabled. */
  isDisabled(): boolean {
    return this.getTriggerElement().disabled;
  }

  /** Returns whether the listbox is currently open. */
  isOpen(): boolean {
    const menu = this.hostEl.querySelector('.ct-select-menu');
    return menu?.getAttribute('data-state') === 'open';
  }

  /** Returns the `aria-expanded` attribute value. */
  getAriaExpanded(): string | null {
    return this.getTriggerElement().getAttribute('aria-expanded');
  }

  /** Returns the `aria-label` attribute value. */
  getAriaLabel(): string | null {
    return this.getTriggerElement().getAttribute('aria-label');
  }

  /** Returns the `aria-labelledby` attribute value. */
  getAriaLabelledBy(): string | null {
    return this.getTriggerElement().getAttribute('aria-labelledby');
  }

  /** Returns the `aria-activedescendant` attribute value. */
  getAriaActiveDescendant(): string | null {
    return this.getTriggerElement().getAttribute('aria-activedescendant');
  }

  /** Returns the `aria-invalid` attribute value. */
  getAriaInvalid(): string | null {
    return this.getTriggerElement().getAttribute('aria-invalid');
  }

  /** Returns the `aria-required` attribute value. */
  getAriaRequired(): string | null {
    return this.getTriggerElement().getAttribute('aria-required');
  }

  /** Returns the `aria-describedby` attribute value. */
  getAriaDescribedBy(): string | null {
    return this.getTriggerElement().getAttribute('aria-describedby');
  }

  /** Returns all option elements inside the listbox. */
  getOptions(): HTMLElement[] {
    return Array.from(this.hostEl.querySelectorAll('[role="option"]'));
  }

  /** Returns the trimmed text of the option at the given index. */
  getOptionText(index: number): string {
    const options = this.getOptions();
    if (index < 0 || index >= options.length) {
      throw new Error(`AfSelectMenuHarness: option index ${index} out of bounds (${options.length} options).`);
    }
    return options[index].textContent?.trim() ?? '';
  }

  /** Returns the number of options. */
  getOptionCount(): number {
    return this.getOptions().length;
  }

  /** Returns whether the option at the given index is selected. */
  isOptionSelected(index: number): boolean {
    return this.getOptions()[index]?.getAttribute('aria-selected') === 'true';
  }

  /** Returns whether the option at the given index is disabled. */
  isOptionDisabled(index: number): boolean {
    return this.getOptions()[index]?.getAttribute('aria-disabled') === 'true';
  }

  /** Returns whether the option at the given index is highlighted. */
  isOptionHighlighted(index: number): boolean {
    return this.getOptions()[index]?.hasAttribute('data-highlighted') ?? false;
  }

  /** Clicks the option at the given index. */
  clickOption(index: number): void {
    const options = this.getOptions();
    if (index < 0 || index >= options.length) {
      throw new Error(`AfSelectMenuHarness: option index ${index} out of bounds (${options.length} options).`);
    }
    options[index].click();
  }

  /** Returns the trimmed label text, or empty string if no label. */
  getLabelText(): string {
    const label = this.hostEl.querySelector('.ct-field__label');
    return label?.textContent?.trim() ?? '';
  }

  /** Returns the trimmed hint text, or empty string if no hint. */
  getHintText(): string {
    const hint = this.hostEl.querySelector('.ct-field__hint');
    return hint?.textContent?.trim() ?? '';
  }

  /** Returns the trimmed error text, or empty string if no error. */
  getErrorText(): string {
    const error = this.hostEl.querySelector('.ct-field__error');
    return error?.textContent?.trim() ?? '';
  }

  /** Returns whether the select-menu wrapper has the given CSS class. */
  hasClass(className: string): boolean {
    const menu = this.hostEl.querySelector('.ct-select-menu');
    return menu?.classList.contains(className) ?? false;
  }
}

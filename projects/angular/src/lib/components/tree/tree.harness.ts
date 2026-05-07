/**
 * Test harness for {@link AfTreeComponent}.
 *
 * Wraps the rendered DOM behind a semantic API so specs and host apps can
 * navigate the tree without coupling to internal CSS class names.
 *
 * @example
 * const harness = new AfTreeHarness(fixture.nativeElement);
 * harness.getNode('root').focus();
 * harness.pressKey('ArrowDown');
 * expect(harness.focusedId()).toBe('child-1');
 */
export class AfTreeHarness {
  private readonly hostEl: HTMLElement;

  constructor(container: HTMLElement) {
    const el = container.querySelector('af-tree');
    if (!el) {
      throw new Error('AfTreeHarness: af-tree element not found in container.');
    }
    this.hostEl = el as HTMLElement;
  }

  /** Container `<ul role="tree">` element. */
  getRootElement(): HTMLElement | null {
    return this.hostEl.querySelector(':scope > ul.ct-tree');
  }

  /** Returns harnesses for every visible (rendered) treeitem in document order. */
  getVisibleNodes(): AfTreeNodeHarness[] {
    const lis = Array.from(this.hostEl.querySelectorAll('li.ct-tree__node'));
    return lis.map((li) => new AfTreeNodeHarness(li as HTMLElement));
  }

  /** Returns the harness for the node with the given id, or null when not rendered. */
  getNode(id: string): AfTreeNodeHarness | null {
    const li = this.hostEl.querySelector<HTMLElement>(
      `li.ct-tree__node[data-tree-id="${cssAttrEscape(id)}"]`,
    );
    return li ? new AfTreeNodeHarness(li) : null;
  }

  /** Id of the currently focused node (the one whose `<li>` carries `tabindex=0`). */
  focusedId(): string | null {
    const li = this.hostEl.querySelector<HTMLElement>('li.ct-tree__node[tabindex="0"]');
    return li?.getAttribute('data-tree-id') ?? null;
  }

  /** Dispatches a keydown on the focused row (or first row if none focused). */
  pressKey(key: string): void {
    const target =
      this.hostEl.querySelector<HTMLElement>('li.ct-tree__node[tabindex="0"]') ??
      this.hostEl.querySelector<HTMLElement>('li.ct-tree__node');
    target?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  }

  /** Returns whether `aria-multiselectable` is set on the root list. */
  isMultiselectable(): boolean {
    return this.getRootElement()?.getAttribute('aria-multiselectable') === 'true';
  }

  /** Returns the `aria-label` of the root list. */
  getAriaLabel(): string | null {
    return this.getRootElement()?.getAttribute('aria-label') ?? null;
  }

  /** True when the empty-state is rendered (no rows visible). */
  isEmpty(): boolean {
    return !this.getRootElement();
  }
}

/** Test harness for a single `<li role="treeitem">` rendered by `af-tree`. */
export class AfTreeNodeHarness {
  constructor(private readonly liEl: HTMLElement) {}

  /** Stable id of the node (mirrors `TreeNode.id`). */
  getId(): string {
    return this.liEl.getAttribute('data-tree-id') ?? '';
  }

  /** Trimmed label text of the node. */
  getLabel(): string {
    const content = this.liEl.querySelector(':scope > .ct-tree__row .ct-tree__content');
    return (content?.textContent ?? '').trim();
  }

  /** 1-based depth of the node. */
  getLevel(): number {
    return Number(this.liEl.getAttribute('aria-level') ?? '0');
  }

  isExpanded(): boolean {
    return this.liEl.getAttribute('aria-expanded') === 'true';
  }

  isExpandable(): boolean {
    return this.liEl.hasAttribute('aria-expanded');
  }

  isSelected(): boolean {
    return this.liEl.getAttribute('aria-selected') === 'true';
  }

  isDisabled(): boolean {
    return this.liEl.getAttribute('aria-disabled') === 'true';
  }

  isBusy(): boolean {
    return this.liEl.getAttribute('aria-busy') === 'true';
  }

  isFocused(): boolean {
    return this.liEl.getAttribute('tabindex') === '0';
  }

  /** Programmatically focus the row's `<li>` element. */
  focus(): void {
    this.liEl.focus();
  }

  /** Click the row (centre area, not the toggle / actions). */
  clickRow(): void {
    const row = this.liEl.querySelector<HTMLElement>(':scope > .ct-tree__row .ct-tree__content');
    row?.click();
  }

  /** Click the chevron toggle button. */
  clickToggle(): void {
    const toggle = this.liEl.querySelector<HTMLElement>(':scope > .ct-tree__row .ct-tree__toggle');
    toggle?.click();
  }

  /** Return the underlying `<li>` element for advanced assertions. */
  getElement(): HTMLElement {
    return this.liEl;
  }
}

/** Escape characters that would break a `[attr="…"]` selector. */
function cssAttrEscape(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }
  return value.replace(/(["\\])/g, '\\$1');
}

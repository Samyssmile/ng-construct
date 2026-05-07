import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  TemplateRef,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { AriaLiveAnnouncer } from '../../utils/aria-live-announcer';
import { AF_TREE_I18N } from './tree.i18n';
import {
  TreeNode,
  TreeNodeTemplateContext,
  TreeSelectionMode,
  TreeToggleEvent,
} from './tree.types';

/** Reset window for incremental type-ahead matching. */
const TYPEAHEAD_RESET_MS = 500;

/** Auto-incremented suffix used for the live-region id when no `aria-label` is set. */
let nextTreeUid = 0;

/**
 * Recursive internal component that renders a single `<li role="treeitem">`
 * and any visible children. Not part of the public API — consumers always
 * use {@link AfTreeComponent}.
 *
 * @docs-private
 */
@Component({
  selector: 'af-tree-node',
  standalone: true,
  imports: [NgTemplateOutlet, forwardRef(() => AfTreeNodeComponent)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <li
      #li
      class="ct-tree__node"
      [class.ct-tree__node--selected]="selected()"
      [class.ct-tree__node--orphan]="orphan()"
      role="treeitem"
      [attr.aria-level]="level()"
      [attr.aria-setsize]="setSize()"
      [attr.aria-posinset]="posInSet()"
      [attr.aria-expanded]="expandable() ? expanded() : null"
      [attr.aria-selected]="ariaSelected()"
      [attr.aria-disabled]="node().disabled ? 'true' : null"
      [attr.aria-busy]="node().loading ? 'true' : null"
      [attr.tabindex]="focused() ? 0 : -1"
      [attr.data-tree-id]="node().id"
      (focus)="onFocus()">
      <div class="ct-tree__row" [style.--ct-level]="level()">
        @if (expandable()) {
          <button
            type="button"
            class="ct-tree__toggle"
            tabindex="-1"
            [attr.aria-hidden]="true"
            [attr.aria-label]="tree.i18n.toggleLabel"
            (click)="onToggleClick($event)">
            <svg
              class="ct-tree__chevron"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
              focusable="false">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
        } @else {
          <span class="ct-tree__spacer" aria-hidden="true"></span>
        }

        <div class="ct-tree__content">
          @if (tree.nodeContent(); as tpl) {
            <ng-container
              [ngTemplateOutlet]="tpl"
              [ngTemplateOutletContext]="templateContext()"></ng-container>
          } @else {
            <span class="ct-tree__label" [innerHTML]="defaultLabelHtml()"></span>
          }
          @if (tree.nodeWarning(); as warnTpl) {
            <ng-container
              [ngTemplateOutlet]="warnTpl"
              [ngTemplateOutletContext]="templateContext()"></ng-container>
          }
          @if (node().loading) {
            <span class="ct-tree__sr-only">{{ tree.i18n.loadingLabel }}</span>
          }
        </div>

        @if (tree.nodeActions(); as actTpl) {
          <div class="ct-tree__actions">
            <ng-container
              [ngTemplateOutlet]="actTpl"
              [ngTemplateOutletContext]="templateContext()"></ng-container>
          </div>
        }
      </div>

      @if (expandable() && expanded() && !node().loading) {
        <ul
          class="ct-tree__group"
          role="group"
          [style.--ct-parent-level]="level() - 1">
          @for (
            child of visibleChildren();
            track tree.trackBy()(child);
            let i = $index, count = $count
          ) {
            <af-tree-node
              [node]="child"
              [level]="level() + 1"
              [setSize]="count"
              [posInSet]="i + 1"></af-tree-node>
          }
        </ul>
      }
    </li>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
      .ct-tree__sr-only {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        margin: -1px;
        padding: 0;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
        border: 0;
      }
    `,
  ],
})
export class AfTreeNodeComponent<T = unknown> {
  /** Backreference to the host tree — provides shared state, templates, and event hooks. */
  protected readonly tree = inject<AfTreeComponent<T>>(forwardRef(() => AfTreeComponent));
  protected readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Node descriptor for this row. */
  node = input.required<TreeNode<T>>();
  /** 1-based depth — sets `aria-level` and the `--ct-level` CSS custom property. */
  level = input.required<number>();
  /** Total siblings on this level — sets `aria-setsize`. */
  setSize = input.required<number>();
  /** 1-based position among siblings — sets `aria-posinset`. */
  posInSet = input.required<number>();

  protected readonly expandable = computed(() => this.tree.isExpandable(this.node()));
  protected readonly expanded = computed(() => this.tree.isExpanded(this.node()));
  protected readonly selected = computed(() => this.tree.isSelected(this.node()));
  protected readonly focused = computed(() => this.tree.focusedId() === this.node().id);
  protected readonly orphan = computed(() => this.node().meta?.['orphan'] === true);

  protected readonly ariaSelected = computed(() => {
    if (this.tree.selection() === 'none') return null;
    return this.selected() ? 'true' : 'false';
  });

  protected readonly visibleChildren = computed(() => {
    const children = this.node().children ?? [];
    return this.tree.filterChildren(children);
  });

  protected readonly defaultLabelHtml = computed(() =>
    this.tree.highlight(this.node().label),
  );

  protected readonly templateContext = computed<TreeNodeTemplateContext<T>>(() => ({
    $implicit: this.node(),
    node: this.node(),
    level: this.level(),
    filter: this.tree.filter(),
    expanded: this.expanded(),
    selected: this.selected(),
    focused: this.focused(),
  }));

  /** Returns the underlying `<li>` element so the host can move DOM focus here. */
  getLiElement(): HTMLElement {
    return this.host.nativeElement.querySelector(':scope > li') as HTMLElement;
  }

  protected onFocus(): void {
    this.tree.focusedId.set(this.node().id);
    this.tree.nodeFocus.emit(this.node());
  }

  protected onToggleClick(event: MouseEvent): void {
    event.stopPropagation();
    if (this.node().disabled) return;
    this.tree.toggle(this.node());
  }
}

/**
 * Accessible Tree component implementing the WAI-ARIA Tree View pattern.
 *
 * Wraps the Construct `ct-tree` CSS component into a signal-based, OnPush
 * Angular component with full keyboard navigation, type-ahead, single /
 * multi-selection, async-load support, and client-side filtering.
 *
 * @example Static org tree
 * <af-tree
 *   [nodes]="organizations()"
 *   ariaLabel="Organizations"
 *   [showIndentGuides]="true"
 *   selection="single"
 *   [(selectedIds)]="selected"
 *   (nodeActivate)="open($event)">
 *   <ng-template #nodeContent let-node>
 *     <af-icon name="folder" />
 *     <span>{{ node.label }}</span>
 *     <af-badge>{{ node.data.customerType }}</af-badge>
 *   </ng-template>
 * </af-tree>
 *
 * @example Async lazy-load
 * <af-tree
 *   [nodes]="nodes()"
 *   ariaLabel="File system"
 *   (loadChildren)="onLoad($event)" />
 *
 * @accessibility
 * - Container exposes `role="tree"` and the required `aria-label`.
 * - Each node is a `<li role="treeitem">` carrying `aria-level`,
 *   `aria-setsize`, `aria-posinset`, and (when expandable) `aria-expanded`.
 * - Roving tabindex on the `<li>` so screen readers announce treeitem role,
 *   level and selection state when focus lands.
 * - Keyboard: `↑`/`↓` move focus, `→` expands or steps into children,
 *   `←` collapses or steps to the parent, `Home`/`End` jump, `Enter`
 *   activates, `Space` toggles selection (multi) or activates (single),
 *   `*` expands all sibling branches, A–Z performs incremental type-ahead.
 * - Selection state is mirrored via `aria-selected` only when
 *   `selection !== 'none'` — leaves implicit selection off in static trees.
 * - `aria-busy="true"` is rendered on rows whose `node.loading` is `true`.
 * - Custom slot templates receive the active filter so they can highlight
 *   matches consistently with the default renderer.
 */
@Component({
  selector: 'af-tree',
  standalone: true,
  imports: [AfTreeNodeComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.af-tree]': 'true',
    '(keydown)': 'handleKeydown($event)',
    '(click)': 'handleClick($event)',
  },
  template: `
    @if (visibleNodes().length > 0) {
      <ul
        [class]="treeClasses()"
        role="tree"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-multiselectable]="selection() === 'multiple' ? 'true' : null">
        @for (
          node of visibleNodes();
          track trackBy()(node);
          let i = $index, count = $count
        ) {
          <af-tree-node
            [node]="node"
            [level]="1"
            [setSize]="count"
            [posInSet]="i + 1"></af-tree-node>
        }
      </ul>
    } @else {
      <div class="af-tree__empty" role="status">
        @if (emptySlot(); as tpl) {
          <ng-container [ngTemplateOutlet]="tpl"></ng-container>
        } @else {
          <span>{{ i18n.emptyMessage }}</span>
        }
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .af-tree__empty {
        padding: var(--space-4, 1rem);
        color: var(--color-text-muted, currentColor);
        font-size: var(--font-size-sm, 0.875rem);
      }
    `,
  ],
})
export class AfTreeComponent<T = unknown> {
  /** Internal id used to scope live-region announcements (debug aid). */
  protected readonly uid = ++nextTreeUid;
  /** I18n bundle resolved via {@link AF_TREE_I18N}. Public so the recursive child component can render labels. */
  readonly i18n = inject(AF_TREE_I18N);
  private readonly announcer = inject(AriaLiveAnnouncer);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  // ─── Inputs ─────────────────────────────────────────────────────────────

  /** Hierarchical node list. */
  nodes = input.required<TreeNode<T>[]>();
  /** Container `aria-label` — required by the WAI-ARIA Tree pattern. */
  ariaLabel = input.required<string>();
  /** Selection mode. Defaults to `'none'`. */
  selection = input<TreeSelectionMode>('none');
  /** Two-way bound set of expanded node ids. */
  expandedIds = model<Set<string>>(new Set());
  /** Two-way bound set of selected node ids. */
  selectedIds = model<Set<string>>(new Set());
  /** Case-insensitive substring filter; auto-expands ancestors of matches. */
  filter = input<string>('');
  /** Render `.ct-tree--guides` (vertical indent lines). */
  showIndentGuides = input(false, { transform: booleanAttribute });
  /** Render `.ct-tree--dense` modifier. */
  dense = input(false, { transform: booleanAttribute });
  /** Render `.ct-tree--bordered` (surface variant). */
  bordered = input(false, { transform: booleanAttribute });
  /** TrackBy override — defaults to `node.id`. */
  trackBy = input<(node: TreeNode<T>) => unknown>((n) => n.id);

  // ─── Outputs ────────────────────────────────────────────────────────────

  /** Emits when a node is activated (Enter or row click). */
  nodeActivate = output<TreeNode<T>>();
  /** Emits when a node is expanded or collapsed. */
  nodeToggle = output<TreeToggleEvent<T>>();
  /** Emits when focus moves to a node. */
  nodeFocus = output<TreeNode<T>>();
  /** Emits the first time a node with `children === undefined` is expanded (lazy-load hook). */
  loadChildren = output<TreeNode<T>>();

  // ─── Slots (ContentChild templates) ─────────────────────────────────────

  /** Template for custom node content; falls back to `node.label` with highlight. */
  nodeContent = contentChild<TemplateRef<TreeNodeTemplateContext<T>>>('nodeContent');
  /** Template for action buttons rendered visible-on-hover/focus. */
  nodeActions = contentChild<TemplateRef<TreeNodeTemplateContext<T>>>('nodeActions');
  /** Template for warning slot (e.g. orphan indicators). */
  nodeWarning = contentChild<TemplateRef<TreeNodeTemplateContext<T>>>('nodeWarning');
  /** Template shown when the (filtered) tree is empty. */
  emptySlot = contentChild<TemplateRef<unknown>>('empty');

  // ─── Internal state ─────────────────────────────────────────────────────

  /** Currently focused node id (drives the roving tabindex). */
  readonly focusedId = signal<string | null>(null);
  /** Tracks nodes whose `loadChildren` has already fired so we don't refire on re-expand. */
  private readonly loadedIds = new Set<string>();
  /** Type-ahead buffer + reset timer. */
  private typeBuffer = '';
  private typeTimer: ReturnType<typeof setTimeout> | null = null;

  // ─── Derived state ──────────────────────────────────────────────────────

  /** Flat list of visible (expanded-path) nodes. Used for keyboard nav. */
  protected readonly visibleNodeOrder = computed(() => {
    const out: TreeNode<T>[] = [];
    const walk = (list: TreeNode<T>[]): void => {
      for (const n of this.filterChildren(list)) {
        out.push(n);
        if (this.isExpanded(n) && !n.loading) {
          walk(n.children ?? []);
        }
      }
    };
    walk(this.nodes());
    return out;
  });

  /** Top-level filtered nodes — used by the template. */
  protected readonly visibleNodes = computed(() => this.filterChildren(this.nodes()));

  protected readonly treeClasses = computed(() => {
    const classes = ['ct-tree'];
    if (this.showIndentGuides()) classes.push('ct-tree--guides');
    if (this.dense()) classes.push('ct-tree--dense');
    if (this.bordered()) classes.push('ct-tree--bordered');
    return classes.join(' ');
  });

  /**
   * Set of node ids matching the current filter. Empty set means no filter active.
   * Filtering is case-insensitive substring on `node.label`.
   */
  private readonly filterMatches = computed(() => {
    const q = this.filter().trim().toLowerCase();
    if (!q) return null;
    const matches = new Set<string>();
    const walk = (list: TreeNode<T>[]): boolean => {
      let any = false;
      for (const n of list) {
        const self = n.label.toLowerCase().includes(q);
        const childHit = walk(n.children ?? []);
        if (self || childHit) {
          matches.add(n.id);
          any = true;
        }
      }
      return any;
    };
    walk(this.nodes());
    return matches;
  });

  /** Auto-expanded ids derived from active filter (ancestors of matches). */
  private readonly autoExpandedIds = computed(() => {
    const matches = this.filterMatches();
    if (!matches) return null;
    const expanded = new Set<string>();
    const walk = (list: TreeNode<T>[]): void => {
      for (const n of list) {
        if (matches.has(n.id) && (n.children?.length ?? 0) > 0) {
          expanded.add(n.id);
        }
        walk(n.children ?? []);
      }
    };
    walk(this.nodes());
    return expanded;
  });

  constructor() {
    /** Seed the focused id when nodes first become available so Tab lands on a row. */
    effect(() => {
      const first = this.visibleNodeOrder()[0];
      const current = this.focusedId();
      if (!first) {
        if (current) this.focusedId.set(null);
        return;
      }
      if (!current || !this.findNode(current)) {
        this.focusedId.set(first.id);
      }
    });
  }

  // ─── State queries (called from the recursive child) ────────────────────

  /** A node is expandable when it has unloaded children, real children, or is loading. */
  isExpandable(node: TreeNode<T>): boolean {
    if (node.isLeaf) return false;
    if (node.loading) return true;
    if (node.children === undefined) return true;
    return node.children.length > 0;
  }

  isExpanded(node: TreeNode<T>): boolean {
    if (this.autoExpandedIds()?.has(node.id)) return true;
    return this.expandedIds().has(node.id);
  }

  isSelected(node: TreeNode<T>): boolean {
    return this.selectedIds().has(node.id);
  }

  /** Returns the children list filtered by the active filter (or all if none). */
  filterChildren(children: TreeNode<T>[]): TreeNode<T>[] {
    const matches = this.filterMatches();
    if (!matches) return children;
    return children.filter((c) => matches.has(c.id));
  }

  /** Wraps the first case-insensitive match of the active filter in `<mark>` tags. */
  highlight(label: string): string {
    const q = this.filter().trim();
    const safe = escapeHtml(label);
    if (!q) return safe;
    const idx = safe.toLowerCase().indexOf(q.toLowerCase());
    if (idx < 0) return safe;
    const end = idx + q.length;
    return `${safe.slice(0, idx)}<mark>${safe.slice(idx, end)}</mark>${safe.slice(end)}`;
  }

  // ─── Mutation API ───────────────────────────────────────────────────────

  /** Toggle the expanded state of `node`; fires `loadChildren` on first lazy-expand. */
  toggle(node: TreeNode<T>): void {
    if (node.disabled || !this.isExpandable(node)) return;
    const wasExpanded = this.expandedIds().has(node.id);
    const next = new Set(this.expandedIds());
    if (wasExpanded) next.delete(node.id);
    else next.add(node.id);
    this.expandedIds.set(next);
    const expanded = !wasExpanded;
    this.nodeToggle.emit({ node, expanded });
    this.announcer.announce(
      (expanded ? this.i18n.expanded : this.i18n.collapsed).replace('{label}', node.label),
    );
    if (expanded && node.children === undefined && !this.loadedIds.has(node.id)) {
      this.loadedIds.add(node.id);
      this.loadChildren.emit(node);
    }
  }

  /**
   * Activate `node` — always emits `nodeActivate` and updates selection per
   * mode. In `multiple` mode `Enter` activates without toggling selection so
   * keyboard users can drive a primary action without disturbing checkboxes.
   */
  activate(node: TreeNode<T>, source: 'click' | 'enter' | 'space'): void {
    if (node.disabled) return;
    const mode = this.selection();
    if (mode === 'single') {
      this.applySingleSelection(node);
    } else if (mode === 'multiple' && source !== 'enter') {
      this.toggleMultiSelection(node);
    }
    this.nodeActivate.emit(node);
  }

  private applySingleSelection(node: TreeNode<T>): void {
    const current = this.selectedIds();
    if (current.size === 1 && current.has(node.id)) return;
    this.selectedIds.set(new Set([node.id]));
    this.announcer.announce(this.i18n.selected.replace('{label}', node.label));
  }

  private toggleMultiSelection(node: TreeNode<T>): void {
    const next = new Set(this.selectedIds());
    if (next.has(node.id)) next.delete(node.id);
    else {
      next.add(node.id);
      this.announcer.announce(this.i18n.selected.replace('{label}', node.label));
    }
    this.selectedIds.set(next);
  }

  // ─── Keyboard handling ──────────────────────────────────────────────────

  protected handleKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const li = target?.closest('li.ct-tree__node') as HTMLElement | null;
    if (!li || !this.host.nativeElement.contains(li)) return;
    const id = li.getAttribute('data-tree-id');
    if (!id) return;
    const node = this.findNode(id);
    if (!node) return;

    const order = this.visibleNodeOrder();
    const idx = order.findIndex((n) => n.id === id);
    if (idx < 0) return;

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        const next = order[Math.min(order.length - 1, idx + 1)];
        if (next) this.moveFocus(next);
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        const prev = order[Math.max(0, idx - 1)];
        if (prev) this.moveFocus(prev);
        break;
      }
      case 'ArrowRight': {
        event.preventDefault();
        if (!this.isExpandable(node)) break;
        if (!this.expandedIds().has(node.id)) {
          this.toggle(node);
        } else {
          const firstChild = (node.children ?? [])[0];
          if (firstChild) this.moveFocus(firstChild);
        }
        break;
      }
      case 'ArrowLeft': {
        event.preventDefault();
        if (this.isExpandable(node) && this.expandedIds().has(node.id)) {
          this.toggle(node);
        } else {
          const parent = this.findParent(node.id);
          if (parent) this.moveFocus(parent);
        }
        break;
      }
      case 'Home': {
        event.preventDefault();
        if (order[0]) this.moveFocus(order[0]);
        break;
      }
      case 'End': {
        event.preventDefault();
        const last = order[order.length - 1];
        if (last) this.moveFocus(last);
        break;
      }
      case 'Enter': {
        event.preventDefault();
        if (node.disabled) break;
        this.activate(node, 'enter');
        break;
      }
      case ' ': {
        event.preventDefault();
        if (node.disabled) break;
        if (this.selection() === 'none') this.activate(node, 'enter');
        else this.activate(node, 'space');
        break;
      }
      case '*': {
        event.preventDefault();
        this.expandClosedSiblings(node);
        break;
      }
      default: {
        if (
          event.key.length === 1 &&
          /\S/.test(event.key) &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.altKey
        ) {
          this.typeahead(event.key);
        }
      }
    }
  }

  protected handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    /** Toggle button has its own handler — it stops propagation, but guard anyway. */
    if (target.closest('.ct-tree__toggle')) return;
    /** Clicks inside the actions slot belong to the consumer's buttons. */
    if (target.closest('.ct-tree__actions')) return;
    const li = target.closest('li.ct-tree__node') as HTMLElement | null;
    if (!li || !this.host.nativeElement.contains(li)) return;
    const id = li.getAttribute('data-tree-id');
    if (!id) return;
    const node = this.findNode(id);
    if (!node || node.disabled) return;
    this.moveFocus(node);
    this.activate(node, 'click');
  }

  private expandClosedSiblings(node: TreeNode<T>): void {
    const parent = this.findParent(node.id);
    const siblings = parent ? (parent.children ?? []) : this.nodes();
    for (const sib of siblings) {
      if (this.isExpandable(sib) && !sib.disabled && !this.expandedIds().has(sib.id)) {
        this.toggle(sib);
      }
    }
  }

  private typeahead(char: string): void {
    this.typeBuffer += char.toLowerCase();
    if (this.typeTimer) clearTimeout(this.typeTimer);
    this.typeTimer = setTimeout(() => {
      this.typeBuffer = '';
      this.typeTimer = null;
    }, TYPEAHEAD_RESET_MS);

    const order = this.visibleNodeOrder();
    if (order.length === 0) return;
    const currentId = this.focusedId();
    const startIdx = Math.max(0, order.findIndex((n) => n.id === currentId));
    const ordered = order.slice(startIdx + 1).concat(order.slice(0, startIdx + 1));
    const buf = this.typeBuffer;
    const match = ordered.find((n) => n.label.toLowerCase().startsWith(buf));
    if (match) this.moveFocus(match);
  }

  // ─── Focus / lookup helpers ─────────────────────────────────────────────

  /** Move focus to `node` — updates the roving tabindex and pulls DOM focus into the tree. */
  private moveFocus(node: TreeNode<T>): void {
    if (node.disabled) return;
    this.focusedId.set(node.id);
    queueMicrotask(() => {
      const el = this.host.nativeElement.querySelector<HTMLElement>(
        `li.ct-tree__node[data-tree-id="${cssEscape(node.id)}"]`,
      );
      el?.focus();
    });
  }

  /** Programmatically focus the tree row matching `id`. */
  focusNode(id: string): void {
    const node = this.findNode(id);
    if (node) this.moveFocus(node);
  }

  /** Walk the tree until a node with the given id is found. */
  findNode(id: string, list: TreeNode<T>[] = this.nodes()): TreeNode<T> | null {
    for (const n of list) {
      if (n.id === id) return n;
      const hit = n.children ? this.findNode(id, n.children) : null;
      if (hit) return hit;
    }
    return null;
  }

  /** Locate the parent of `id` — returns null when the node is at root level. */
  findParent(id: string, list: TreeNode<T>[] = this.nodes()): TreeNode<T> | null {
    for (const n of list) {
      if (n.children?.some((c) => c.id === id)) return n;
      if (n.children) {
        const hit = this.findParent(id, n.children);
        if (hit) return hit;
      }
    }
    return null;
  }
}

/** Minimal HTML escaper for the default label renderer. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Escape an arbitrary id for safe use inside a `[data-tree-id="…"]` attribute selector. */
function cssEscape(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }
  return value.replace(/(["\\])/g, '\\$1');
}

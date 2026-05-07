/**
 * Node descriptor consumed by `af-tree`.
 *
 * Generic over the application data type `T` so consumers can attach typed
 * payloads without losing type safety in slot templates.
 */
export interface TreeNode<T = unknown> {
  /** Stable id; used as the default `trackBy` key. */
  id: string;
  /** Human-readable label; rendered as a11y fallback when no `nodeContent` slot is provided. */
  label: string;
  /** Arbitrary application data — typed via the generic parameter. */
  data?: T;
  /** Child nodes; `undefined` triggers async-load on first expand, `[]` is a known-empty leaf. */
  children?: TreeNode<T>[];
  /** Disabled nodes cannot receive focus, expand, select, or activate. */
  disabled?: boolean;
  /** Force leaf rendering even when `children` is undefined (skips async-load hint). */
  isLeaf?: boolean;
  /** Renders a busy indicator on the row — set while children are loading. */
  loading?: boolean;
  /** Free-form metadata; e.g. `{ orphan: true }` enables the warning state. */
  meta?: Record<string, unknown>;
}

/** Selection mode for the tree. */
export type TreeSelectionMode = 'none' | 'single' | 'multiple';

/** Payload of the `nodeToggle` output. */
export interface TreeToggleEvent<T = unknown> {
  node: TreeNode<T>;
  expanded: boolean;
}

/**
 * Context object passed to slot templates so consumers can render bespoke
 * content while still receiving the active filter for custom highlighting.
 */
export interface TreeNodeTemplateContext<T = unknown> {
  $implicit: TreeNode<T>;
  node: TreeNode<T>;
  level: number;
  filter: string;
  expanded: boolean;
  selected: boolean;
  focused: boolean;
}

import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AfBadgeComponent,
  AfButtonComponent,
  AfCardComponent,
  AfIconComponent,
  AfInputComponent,
  AfTreeComponent,
  TreeNode,
} from '@neuravision/ng-construct';
import { LucidePlus, LucideTriangleAlert, LucideRefreshCw } from '@lucide/angular';

interface OrgPayload {
  customerType: 'platform-operator' | 'direct' | 'whitelabel' | 'whitelabel-sub';
  billingId: string;
}

const SEED_TREE: TreeNode<OrgPayload>[] = [
  {
    id: 'platform',
    label: 'Accessful Platform',
    data: { customerType: 'platform-operator', billingId: 'ACC-000' },
    children: [
      {
        id: 'wl-acme',
        label: 'Acme Whitelabel',
        data: { customerType: 'whitelabel', billingId: 'WL-100' },
        children: [
          {
            id: 'sub-acme-de',
            label: 'Acme DE',
            data: { customerType: 'whitelabel-sub', billingId: 'WL-100-DE' },
            children: [
              {
                id: 'sub-acme-de-berlin',
                label: 'Acme Berlin',
                data: { customerType: 'whitelabel-sub', billingId: 'WL-100-DE-B' },
                children: [],
              },
              {
                id: 'sub-acme-de-hamburg',
                label: 'Acme Hamburg',
                data: { customerType: 'whitelabel-sub', billingId: 'WL-100-DE-H' },
                children: [],
              },
            ],
          },
          {
            id: 'sub-acme-fr',
            label: 'Acme FR',
            data: { customerType: 'whitelabel-sub', billingId: 'WL-100-FR' },
            children: [],
          },
        ],
      },
      {
        id: 'wl-globex',
        label: 'Globex Whitelabel',
        data: { customerType: 'whitelabel', billingId: 'WL-200' },
        children: [
          {
            id: 'sub-globex-uk',
            label: 'Globex UK',
            data: { customerType: 'whitelabel-sub', billingId: 'WL-200-UK' },
            children: [],
          },
        ],
      },
      {
        id: 'direct-northwind',
        label: 'Northwind GmbH',
        data: { customerType: 'direct', billingId: 'ACC-301' },
        children: [],
      },
      {
        id: 'direct-stark',
        label: 'Stark Industries',
        data: { customerType: 'direct', billingId: 'ACC-302' },
        children: [],
      },
    ],
  },
  {
    id: 'orphan-1',
    label: 'Orphan Sub-Org',
    data: { customerType: 'whitelabel-sub', billingId: 'WL-???-OR' },
    meta: { orphan: true },
    children: [],
  },
];

const LAZY_TREE: TreeNode<unknown>[] = [
  { id: 'src', label: 'src/', children: undefined },
  { id: 'docs', label: 'docs/', children: undefined },
  { id: 'tests', label: 'tests/', children: undefined },
];

@Component({
  selector: 'app-tree-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AfTreeComponent,
    AfCardComponent,
    AfBadgeComponent,
    AfButtonComponent,
    AfIconComponent,
    AfInputComponent,
    FormsModule,
    LucidePlus,
    LucideTriangleAlert,
    LucideRefreshCw,
  ],
  templateUrl: './tree-showcase.component.html',
  styleUrl: './tree-showcase.component.css',
})
export class TreeShowcaseComponent {
  // ── Static org tree (with selection) ──
  readonly orgs = signal<TreeNode<OrgPayload>[]>(SEED_TREE);
  readonly selectedOrgIds = signal(new Set<string>());
  readonly expandedOrgIds = signal(new Set<string>(['platform']));
  readonly orgFilter = signal('');
  readonly lastActivated = signal<TreeNode<OrgPayload> | null>(null);

  readonly selectedOrgLabel = computed(() => {
    const ids = Array.from(this.selectedOrgIds());
    if (ids.length === 0) return '—';
    return ids.join(', ');
  });

  // ── Lazy-load file tree ──
  readonly files = signal<TreeNode<unknown>[]>(LAZY_TREE);
  readonly loadEvents = signal<string[]>([]);

  // ── Multi-select dense tree ──
  readonly checkSelections = signal(new Set<string>());

  /**
   * Append a child stub to a whitelabel node, demonstrating the "add sub-org"
   * row action on the tree.
   */
  addSub(node: TreeNode<OrgPayload>): void {
    if (node.data?.customerType !== 'whitelabel' && node.data?.customerType !== 'whitelabel-sub') {
      return;
    }
    const id = `${node.id}-sub-${Date.now().toString(36)}`;
    this.orgs.update((list) =>
      patch(list, node.id, (n) => ({
        ...n,
        children: [
          ...(n.children ?? []),
          {
            id,
            label: `${n.label} → New`,
            data: { customerType: 'whitelabel-sub', billingId: `${n.data?.billingId ?? '?'}-NEW` },
            children: [],
          },
        ],
      })),
    );
    this.expandedOrgIds.update((s) => new Set(s).add(node.id));
  }

  /** Lazy-load handler: marks busy, then patches in two stub children after 600ms. */
  onLoad(node: TreeNode<unknown>): void {
    this.loadEvents.update((list) => [...list, `loadChildren(${node.id})`]);
    this.files.update((list) => patch(list, node.id, (n) => ({ ...n, loading: true })));
    setTimeout(() => {
      this.files.update((list) =>
        patch(list, node.id, (n) => ({
          ...n,
          loading: false,
          children: [
            { id: `${n.id}-readme.md`, label: 'README.md', isLeaf: true },
            { id: `${n.id}-index.ts`, label: 'index.ts', isLeaf: true },
          ],
        })),
      );
    }, 600);
  }

  /** Reset the lazy tree so the consumer can replay the demo. */
  resetLazy(): void {
    this.files.set(structuredClone(LAZY_TREE));
    this.loadEvents.set([]);
  }

  /** Map a customer-type to a badge variant for the org tree slot. */
  badgeVariant(type: OrgPayload['customerType']): 'info' | 'success' | 'default' | 'warning' {
    switch (type) {
      case 'platform-operator':
        return 'success';
      case 'whitelabel':
        return 'info';
      case 'whitelabel-sub':
        return 'default';
      default:
        return 'default';
    }
  }

  /** Highlight the active filter substring in the slot's custom label rendering. */
  highlightLabel(label: string): string {
    const q = this.orgFilter().trim();
    const safe = escapeHtml(label);
    if (!q) return safe;
    const idx = safe.toLowerCase().indexOf(q.toLowerCase());
    if (idx < 0) return safe;
    return `${safe.slice(0, idx)}<mark>${safe.slice(idx, idx + q.length)}</mark>${safe.slice(
      idx + q.length,
    )}`;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function patch<T>(
  list: TreeNode<T>[],
  id: string,
  fn: (n: TreeNode<T>) => TreeNode<T>,
): TreeNode<T>[] {
  return list.map((n) =>
    n.id === id ? fn(n) : { ...n, children: n.children ? patch(n.children, id, fn) : n.children },
  );
}

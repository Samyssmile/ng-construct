import { Meta, StoryObj } from '@storybook/angular';
import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
  signal,
} from '@angular/core';
import { AfTreeComponent } from './tree.component';
import { TreeNode } from './tree.types';

interface OrgPayload {
  customerType: 'platform-operator' | 'direct' | 'whitelabel' | 'whitelabel-sub';
  badge?: string;
}

const SAMPLE_TREE: TreeNode<OrgPayload>[] = [
  {
    id: 'platform',
    label: 'Accessful',
    data: { customerType: 'platform-operator' },
    children: [
      {
        id: 'wl-acme',
        label: 'Acme Whitelabel',
        data: { customerType: 'whitelabel' },
        children: [
          {
            id: 'sub-acme-de',
            label: 'Acme DE',
            data: { customerType: 'whitelabel-sub' },
            children: [
              {
                id: 'sub-acme-de-berlin',
                label: 'Acme Berlin',
                data: { customerType: 'whitelabel-sub' },
                children: [],
              },
            ],
          },
          {
            id: 'sub-acme-fr',
            label: 'Acme FR',
            data: { customerType: 'whitelabel-sub' },
            children: [],
          },
        ],
      },
      {
        id: 'direct-northwind',
        label: 'Northwind GmbH',
        data: { customerType: 'direct' },
        children: [],
      },
    ],
  },
  {
    id: 'orphan',
    label: 'Orphan Sub-Org',
    data: { customerType: 'whitelabel-sub' },
    meta: { orphan: true },
    children: [],
  },
];

// ── Playground ─────────────────────────────────────────────────────────────

@Component({
  selector: 'af-tree-playground-story',
  standalone: true,
  imports: [AfTreeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <af-tree
      [nodes]="nodes"
      ariaLabel="Organizations"
      [showIndentGuides]="true" />
  `,
})
class TreePlaygroundStoryComponent {
  readonly nodes = SAMPLE_TREE;
}

// ── Selection ──────────────────────────────────────────────────────────────

@Component({
  selector: 'af-tree-selection-story',
  standalone: true,
  imports: [AfTreeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <af-tree
      [nodes]="nodes"
      ariaLabel="Organizations"
      selection="single"
      [showIndentGuides]="true"
      [(selectedIds)]="selected" />
    <p style="margin-top: 1rem; font-size: 0.875rem;">
      Selected: {{ selectedLabel() }}
    </p>
  `,
})
class TreeSelectionStoryComponent {
  readonly nodes = SAMPLE_TREE;
  readonly selected = signal(new Set<string>());
  readonly selectedLabel = computed(() => Array.from(this.selected()).join(', ') || '—');
}

// ── Multi-select ───────────────────────────────────────────────────────────

@Component({
  selector: 'af-tree-multi-story',
  standalone: true,
  imports: [AfTreeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <af-tree
      [nodes]="nodes"
      ariaLabel="Organizations"
      selection="multiple"
      dense
      [showIndentGuides]="true"
      [(selectedIds)]="selected" />
  `,
})
class TreeMultiStoryComponent {
  readonly nodes = SAMPLE_TREE;
  readonly selected = signal(new Set<string>());
}

// ── Filtered ───────────────────────────────────────────────────────────────

@Component({
  selector: 'af-tree-filter-story',
  standalone: true,
  imports: [AfTreeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label
      style="display:flex; flex-direction:column; gap:.25rem; margin-bottom:.75rem;
             font-size:0.875rem;">
      Search organizations
      <input
        type="search"
        [value]="filter()"
        (input)="filter.set($any($event.target).value)"
        placeholder="Type to filter…"
        style="padding:.375rem .5rem; border:1px solid var(--color-border-subtle);
               border-radius:.25rem;" />
    </label>
    <af-tree
      [nodes]="nodes"
      ariaLabel="Organizations"
      [filter]="filter()"
      [showIndentGuides]="true" />
  `,
})
class TreeFilterStoryComponent {
  readonly nodes = SAMPLE_TREE;
  readonly filter = signal('');
}

// ── Async / lazy-load ──────────────────────────────────────────────────────

@Component({
  selector: 'af-tree-async-story',
  standalone: true,
  imports: [AfTreeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <af-tree
      [nodes]="nodes()"
      ariaLabel="File system"
      (loadChildren)="onLoad($event)" />
  `,
})
class TreeAsyncStoryComponent {
  readonly nodes = signal<TreeNode<unknown>[]>([
    { id: 'root', label: 'src/', children: undefined },
    { id: 'docs', label: 'docs/', children: undefined },
  ]);

  onLoad(node: TreeNode<unknown>): void {
    /** Mark the node as loading then patch children after a 500ms delay. */
    this.nodes.update((list) => patchNode(list, node.id, (n) => ({ ...n, loading: true })));
    setTimeout(() => {
      this.nodes.update((list) =>
        patchNode(list, node.id, (n) => ({
          ...n,
          loading: false,
          children: [
            { id: `${n.id}-a`, label: `${n.label}/file-a.ts`, isLeaf: true },
            { id: `${n.id}-b`, label: `${n.label}/file-b.ts`, isLeaf: true },
          ],
        })),
      );
    }, 500);
  }
}

function patchNode<T>(
  list: TreeNode<T>[],
  id: string,
  fn: (n: TreeNode<T>) => TreeNode<T>,
): TreeNode<T>[] {
  return list.map((n) =>
    n.id === id
      ? fn(n)
      : { ...n, children: n.children ? patchNode(n.children, id, fn) : n.children },
  );
}

// ── Custom slots ───────────────────────────────────────────────────────────

@Component({
  selector: 'af-tree-slots-story',
  standalone: true,
  imports: [AfTreeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <af-tree
      [nodes]="nodes"
      ariaLabel="Organizations with custom content"
      [showIndentGuides]="true">
      <ng-template #nodeContent let-node let-filter="filter">
        <span class="ct-tree__label">{{ node.label }}</span>
        <span
          style="font-size:.75rem; padding:.125rem .375rem; border-radius:9999px;
                 background: var(--color-bg-muted); color: var(--color-text-secondary);">
          {{ node.data.customerType }}
        </span>
      </ng-template>

      <ng-template #nodeActions let-node>
        <button
          type="button"
          (click)="addSub(node); $event.stopPropagation()"
          style="font-size:.75rem;">
          + sub
        </button>
      </ng-template>
    </af-tree>
  `,
})
class TreeSlotsStoryComponent {
  readonly nodes = SAMPLE_TREE;
  addSub(node: TreeNode<OrgPayload>): void {
    /** Story-only stub — wired up by consuming app. */
    console.info('addSub', node.id);
  }
}

// ── Storybook meta ─────────────────────────────────────────────────────────

const meta: Meta<AfTreeComponent> = {
  title: 'Angular/Tree',
  component: AfTreeComponent,
  parameters: {
    docs: {
      description: {
        component:
          'Accessible tree view (WAI-ARIA Tree pattern) with keyboard navigation, ' +
          'type-ahead, async lazy-load, client-side filter and roving tabindex.',
      },
    },
  },
  render: () => ({ component: TreePlaygroundStoryComponent }),
};

export default meta;

export const Playground: StoryObj<AfTreeComponent> = {};

export const SingleSelection: StoryObj<AfTreeComponent> = {
  render: () => ({ component: TreeSelectionStoryComponent }),
};

export const MultiSelection: StoryObj<AfTreeComponent> = {
  render: () => ({ component: TreeMultiStoryComponent }),
};

export const Filtered: StoryObj<AfTreeComponent> = {
  render: () => ({ component: TreeFilterStoryComponent }),
};

export const AsyncLazyLoad: StoryObj<AfTreeComponent> = {
  render: () => ({ component: TreeAsyncStoryComponent }),
};

export const CustomSlots: StoryObj<AfTreeComponent> = {
  render: () => ({ component: TreeSlotsStoryComponent }),
};

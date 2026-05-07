import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AfTreeComponent } from './tree.component';
import { AfTreeHarness } from './tree.harness';
import { TreeNode } from './tree.types';
import { checkA11y } from '../../testing/axe-helper';

// ────────────────────────────────────────────────────────────────────────────
// Fixtures
// ────────────────────────────────────────────────────────────────────────────

interface OrgPayload {
  customerType: string;
}

function makeOrgs(): TreeNode<OrgPayload>[] {
  return [
    {
      id: 'wl-1',
      label: 'Whitelabel One',
      data: { customerType: 'whitelabel' },
      children: [
        {
          id: 'sub-1a',
          label: 'Sub Alpha',
          data: { customerType: 'whitelabel-sub' },
          children: [
            {
              id: 'sub-1a-deep',
              label: 'Sub Alpha Deep',
              data: { customerType: 'whitelabel-sub' },
              children: [],
            },
          ],
        },
        {
          id: 'sub-1b',
          label: 'Sub Beta',
          data: { customerType: 'whitelabel-sub' },
          children: [],
        },
      ],
    },
    {
      id: 'direct-1',
      label: 'Direct Customer',
      data: { customerType: 'direct' },
      children: [],
    },
    {
      id: 'orphan-1',
      label: 'Orphan Sub',
      data: { customerType: 'whitelabel-sub' },
      meta: { orphan: true },
      children: [],
    },
  ];
}

@Component({
  imports: [AfTreeComponent],
  template: `
    <af-tree
      [nodes]="nodes()"
      [ariaLabel]="ariaLabel()"
      [selection]="selection()"
      [(expandedIds)]="expanded"
      [(selectedIds)]="selected"
      [showIndentGuides]="guides()"
      [filter]="filter()"
      (nodeActivate)="lastActivated.set($event.id)"
      (nodeToggle)="lastToggle.set($event)"
      (loadChildren)="incrementLoad()" />
  `,
})
class TestHostComponent {
  readonly nodes = signal<TreeNode<OrgPayload>[]>(makeOrgs());
  readonly ariaLabel = signal('Organizations');
  readonly selection = signal<'none' | 'single' | 'multiple'>('none');
  readonly expanded = signal(new Set<string>());
  readonly selected = signal(new Set<string>());
  readonly guides = signal(false);
  readonly filter = signal('');

  readonly lastActivated = signal<string | null>(null);
  readonly lastToggle = signal<{ node: TreeNode<OrgPayload>; expanded: boolean } | null>(null);
  readonly loadCount = signal(0);

  incrementLoad(): void {
    this.loadCount.update((n) => n + 1);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function setup(): { fixture: ComponentFixture<TestHostComponent>; host: TestHostComponent; harness: AfTreeHarness } {
  TestBed.configureTestingModule({ imports: [TestHostComponent] });
  const fixture = TestBed.createComponent(TestHostComponent);
  fixture.detectChanges();
  return {
    fixture,
    host: fixture.componentInstance,
    harness: new AfTreeHarness(fixture.nativeElement),
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Tests
// ────────────────────────────────────────────────────────────────────────────

describe('AfTreeComponent', () => {
  // ── Rendering ──

  it('renders the root list with role=tree and aria-label', () => {
    const { harness } = setup();
    expect(harness.getRootElement()).toBeTruthy();
    expect(harness.getAriaLabel()).toBe('Organizations');
    expect(harness.getRootElement()?.getAttribute('role')).toBe('tree');
  });

  it('renders top-level nodes with aria-level=1 and aria-setsize', () => {
    const { harness } = setup();
    const wl = harness.getNode('wl-1')!;
    expect(wl.getLevel()).toBe(1);
    expect(wl.getElement().getAttribute('aria-setsize')).toBe('3');
    expect(wl.getElement().getAttribute('aria-posinset')).toBe('1');
  });

  it('marks expandable nodes with aria-expanded and leaves leaves without it', () => {
    const { harness } = setup();
    expect(harness.getNode('wl-1')!.isExpandable()).toBe(true);
    expect(harness.getNode('direct-1')!.isExpandable()).toBe(false);
  });

  it('does not render children when collapsed', () => {
    const { harness } = setup();
    expect(harness.getNode('sub-1a')).toBeNull();
  });

  // ── Expand / collapse ──

  it('expands when toggle is clicked and renders children with correct level', () => {
    const { harness, fixture } = setup();
    harness.getNode('wl-1')!.clickToggle();
    fixture.detectChanges();
    const sub = harness.getNode('sub-1a')!;
    expect(sub).toBeTruthy();
    expect(sub.getLevel()).toBe(2);
  });

  it('toggle emits nodeToggle with the new expanded value', () => {
    const { harness, host, fixture } = setup();
    harness.getNode('wl-1')!.clickToggle();
    fixture.detectChanges();
    expect(host.lastToggle()?.expanded).toBe(true);
    expect(host.lastToggle()?.node.id).toBe('wl-1');
  });

  it('renders nested levels with aria-level reflecting depth', () => {
    const { harness, host, fixture } = setup();
    host.expanded.set(new Set(['wl-1', 'sub-1a']));
    fixture.detectChanges();
    expect(harness.getNode('sub-1a-deep')!.getLevel()).toBe(3);
  });

  // ── Roving tabindex / keyboard ──

  it('seeds focus on the first visible node', () => {
    const { harness } = setup();
    expect(harness.focusedId()).toBe('wl-1');
  });

  it('ArrowDown moves focus to the next visible node', () => {
    const { harness, fixture } = setup();
    harness.getNode('wl-1')!.focus();
    harness.pressKey('ArrowDown');
    fixture.detectChanges();
    expect(harness.focusedId()).toBe('direct-1');
  });

  it('ArrowRight on collapsed expandable node expands it', () => {
    const { harness, host, fixture } = setup();
    harness.getNode('wl-1')!.focus();
    harness.pressKey('ArrowRight');
    fixture.detectChanges();
    expect(host.expanded().has('wl-1')).toBe(true);
  });

  it('ArrowRight on already-expanded node moves focus into first child', () => {
    const { harness, host, fixture } = setup();
    host.expanded.set(new Set(['wl-1']));
    fixture.detectChanges();
    harness.getNode('wl-1')!.focus();
    harness.pressKey('ArrowRight');
    fixture.detectChanges();
    expect(harness.focusedId()).toBe('sub-1a');
  });

  it('ArrowLeft collapses expanded node, then steps to parent on next press', () => {
    const { harness, host, fixture } = setup();
    host.expanded.set(new Set(['wl-1']));
    fixture.detectChanges();
    harness.getNode('sub-1a')!.focus();
    fixture.detectChanges();

    harness.pressKey('ArrowLeft');
    fixture.detectChanges();
    expect(harness.focusedId()).toBe('wl-1');
    expect(host.expanded().has('wl-1')).toBe(true); // sub-1a is collapsed by default

    harness.pressKey('ArrowLeft');
    fixture.detectChanges();
    expect(host.expanded().has('wl-1')).toBe(false);
  });

  it('Home jumps to the first node, End to the last visible', () => {
    const { harness, host, fixture } = setup();
    host.expanded.set(new Set(['wl-1']));
    fixture.detectChanges();

    harness.getNode('sub-1a')!.focus();
    harness.pressKey('Home');
    fixture.detectChanges();
    expect(harness.focusedId()).toBe('wl-1');

    harness.pressKey('End');
    fixture.detectChanges();
    expect(harness.focusedId()).toBe('orphan-1');
  });

  it('type-ahead jumps to the next node whose label starts with the buffer', async () => {
    const { harness, fixture } = setup();
    harness.getNode('wl-1')!.focus();
    harness.pressKey('d');
    fixture.detectChanges();
    expect(harness.focusedId()).toBe('direct-1');

    // Wait past the 500ms type-ahead reset, then 'o' should match Orphan.
    await new Promise((r) => setTimeout(r, 600));
    harness.pressKey('o');
    fixture.detectChanges();
    expect(harness.focusedId()).toBe('orphan-1');
  });

  // ── Selection ──

  it('single selection: Enter selects and emits nodeActivate', () => {
    const { harness, host, fixture } = setup();
    host.selection.set('single');
    fixture.detectChanges();
    harness.getNode('wl-1')!.focus();
    harness.pressKey('Enter');
    fixture.detectChanges();
    expect(host.selected()).toEqual(new Set(['wl-1']));
    expect(host.lastActivated()).toBe('wl-1');
  });

  it('single selection: clicking another row replaces the selection', () => {
    const { harness, host, fixture } = setup();
    host.selection.set('single');
    fixture.detectChanges();
    harness.getNode('wl-1')!.clickRow();
    fixture.detectChanges();
    harness.getNode('direct-1')!.clickRow();
    fixture.detectChanges();
    expect(host.selected()).toEqual(new Set(['direct-1']));
  });

  it('multiple selection: Space toggles, Enter activates without changing selection', () => {
    const { harness, host, fixture } = setup();
    host.selection.set('multiple');
    fixture.detectChanges();

    harness.getNode('wl-1')!.focus();
    harness.pressKey(' ');
    fixture.detectChanges();
    expect(host.selected().has('wl-1')).toBe(true);

    harness.pressKey('ArrowDown');
    fixture.detectChanges();
    harness.pressKey(' ');
    fixture.detectChanges();
    expect(host.selected()).toEqual(new Set(['wl-1', 'direct-1']));

    // Enter should NOT touch selection in multi mode.
    harness.pressKey('Enter');
    fixture.detectChanges();
    expect(host.selected()).toEqual(new Set(['wl-1', 'direct-1']));
    expect(host.lastActivated()).toBe('direct-1');
  });

  it('aria-multiselectable is set only in multi mode', () => {
    const { harness, host, fixture } = setup();
    expect(harness.isMultiselectable()).toBe(false);
    host.selection.set('multiple');
    fixture.detectChanges();
    expect(harness.isMultiselectable()).toBe(true);
  });

  // ── Filter ──

  it('filter hides non-matching siblings and auto-expands ancestors', () => {
    const { harness, host, fixture } = setup();
    host.filter.set('alpha deep');
    fixture.detectChanges();

    expect(harness.getNode('sub-1a-deep')).toBeTruthy();
    expect(harness.getNode('direct-1')).toBeNull();
    // Ancestors auto-expanded.
    expect(harness.getNode('sub-1a')!.isExpanded()).toBe(true);
    expect(harness.getNode('wl-1')!.isExpanded()).toBe(true);
  });

  it('filter highlights the matched substring with <mark>', () => {
    const { harness, host, fixture } = setup();
    host.filter.set('Direct');
    fixture.detectChanges();
    const label = harness
      .getNode('direct-1')!
      .getElement()
      .querySelector('.ct-tree__label')!;
    expect(label.innerHTML).toContain('<mark>Direct</mark>');
  });

  // ── Async loading ──

  it('emits loadChildren the first time a node with undefined children is expanded', () => {
    const { fixture, host, harness } = setup();
    host.nodes.set([
      { id: 'lazy', label: 'Lazy', children: undefined },
    ]);
    fixture.detectChanges();
    harness.getNode('lazy')!.clickToggle();
    fixture.detectChanges();
    expect(host.loadCount()).toBe(1);

    // Collapse and re-expand should not refire.
    harness.getNode('lazy')!.clickToggle();
    fixture.detectChanges();
    harness.getNode('lazy')!.clickToggle();
    fixture.detectChanges();
    expect(host.loadCount()).toBe(1);
  });

  it('renders aria-busy on loading nodes and suppresses the child group', () => {
    const { fixture, host, harness } = setup();
    host.nodes.set([
      {
        id: 'lazy',
        label: 'Lazy',
        loading: true,
        children: [{ id: 'should-be-hidden', label: 'Hidden', children: [] }],
      },
    ]);
    host.expanded.set(new Set(['lazy']));
    fixture.detectChanges();
    expect(harness.getNode('lazy')!.isBusy()).toBe(true);
    expect(harness.getNode('should-be-hidden')).toBeNull();
  });

  // ── Disabled ──

  it('disabled nodes do not select or activate on click', () => {
    const { fixture, host, harness } = setup();
    host.nodes.set([{ id: 'a', label: 'A', disabled: true, children: [] }]);
    host.selection.set('single');
    fixture.detectChanges();
    harness.getNode('a')!.clickRow();
    fixture.detectChanges();
    expect(host.selected().size).toBe(0);
    expect(host.lastActivated()).toBeNull();
  });

  // ── Empty state ──

  it('renders the default empty message when there are no nodes', () => {
    const { fixture, host, harness } = setup();
    host.nodes.set([]);
    fixture.detectChanges();
    expect(harness.isEmpty()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('No entries');
  });

  // ── A11y (axe) ──

  it('passes axe checks in the default rendered state', async () => {
    const { fixture } = setup();
    await checkA11y(fixture.nativeElement);
  });

  it('passes axe checks with multi-selection and expanded children', async () => {
    const { fixture, host } = setup();
    host.selection.set('multiple');
    host.expanded.set(new Set(['wl-1', 'sub-1a']));
    host.selected.set(new Set(['sub-1a-deep']));
    fixture.detectChanges();
    await checkA11y(fixture.nativeElement);
  });
});

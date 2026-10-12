import { Component, contentChildren, viewChildren, ElementRef, computed, effect, input, model, ChangeDetectionStrategy } from '@angular/core';

export interface AfTab {
  id: string;
  label: string;
  disabled?: boolean;
}

/**
 * Tab panel component (used within af-tabs)
 */
@Component({
  selector: 'af-tab-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isActive()) {
      <div
        class="ct-tabs__panel"
        role="tabpanel"
        [attr.id]="'panel-' + resolvedId()"
        [attr.aria-labelledby]="'tab-' + resolvedId()">
        <ng-content></ng-content>
      </div>
    }
  `
})
export class AfTabPanelComponent {
  private static nextId = 0;
  private readonly fallbackId = `af-tab-${AfTabPanelComponent.nextId++}`;

  id = model('');
  label = input('');
  isActive = model(false);
  disabled = input(false);

  /** The panel's effective id: the bound `id`, or a stable generated one when none is given. */
  readonly resolvedId = computed(() => this.id() || this.fallbackId);

  /**
   * Writes the generated id into `id` when none was bound and returns the effective id.
   * Kept for backwards compatibility; read {@link resolvedId} instead.
   */
  ensureId(): string {
    if (!this.id()) {
      this.id.set(this.fallbackId);
    }
    return this.id();
  }
}

/**
 * Tabs component for organizing content into panels
 *
 * @example
 * <af-tabs [(activeTab)]="activeTab">
 *   <af-tab-panel id="overview" label="Overview">
 *     <p>Overview content</p>
 *   </af-tab-panel>
 *   <af-tab-panel id="settings" label="Settings">
 *     <p>Settings content</p>
 *   </af-tab-panel>
 * </af-tabs>
 */
@Component({
  selector: 'af-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ct-tabs">
      <div class="ct-tabs__list" role="tablist">
        @for (tab of tabs(); track tab.id) {
          <button
            #tabButton
            class="ct-tabs__trigger"
            role="tab"
            [attr.aria-selected]="activeTab() === tab.id"
            [attr.aria-controls]="'panel-' + tab.id"
            [attr.id]="'tab-' + tab.id"
            [attr.tabindex]="activeTab() === tab.id ? 0 : -1"
            [disabled]="tab.disabled"
            [attr.data-tab-id]="tab.id"
            type="button"
            (click)="selectTab(tab.id)"
            (keydown)="onKeydown($event, tab.id)">
            {{ tab.label }}
          </button>
        }
      </div>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AfTabsComponent {
  /** Currently active tab ID (two-way bound) */
  activeTab = model('');

  panels = contentChildren(AfTabPanelComponent);
  tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tabButton');

  /**
   * Tab triggers derived from the projected panels. A signal, so a panel whose `label` or
   * `disabled` binding changes (e.g. a live count like "Members (3)") re-renders its trigger.
   */
  readonly tabs = computed<AfTab[]>(() =>
    this.panels().map(panel => ({
      id: panel.resolvedId(),
      label: panel.label() || panel.resolvedId(),
      disabled: panel.disabled()
    }))
  );

  private panelsEffect = effect(() => {
    this.syncTabsFromPanels();
  });

  selectTab(id: string): void {
    if (this.activeTab() !== id) {
      this.activeTab.set(id);
      this.syncActivePanel();
    }
  }

  onKeydown(event: KeyboardEvent, currentId: string): void {
    const enabledTabs = this.tabs().filter(tab => !tab.disabled);
    if (enabledTabs.length === 0) return;

    const currentIndex = enabledTabs.findIndex(tab => tab.id === currentId);
    const lastIndex = enabledTabs.length - 1;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown': {
        event.preventDefault();
        const next = enabledTabs[(currentIndex + 1) % enabledTabs.length];
        this.focusTab(next.id);
        break;
      }
      case 'ArrowLeft':
      case 'ArrowUp': {
        event.preventDefault();
        const prev = enabledTabs[(currentIndex - 1 + enabledTabs.length) % enabledTabs.length];
        this.focusTab(prev.id);
        break;
      }
      case 'Home': {
        event.preventDefault();
        this.focusTab(enabledTabs[0].id);
        break;
      }
      case 'End': {
        event.preventDefault();
        this.focusTab(enabledTabs[lastIndex].id);
        break;
      }
      case 'Enter':
      case ' ': {
        event.preventDefault();
        this.selectTab(currentId);
        break;
      }
      default:
        break;
    }
  }

  private syncTabsFromPanels(): void {
    const tabs = this.tabs();

    if (!this.activeTab() || !tabs.some(tab => tab.id === this.activeTab() && !tab.disabled)) {
      const firstEnabled = tabs.find(tab => !tab.disabled);
      if (firstEnabled) {
        this.activeTab.set(firstEnabled.id);
      }
    }

    this.syncActivePanel();
  }

  private syncActivePanel(): void {
    const panels = this.panels();
    if (!panels.length) return;
    panels.forEach(panel => {
      panel.isActive.set(panel.resolvedId() === this.activeTab());
    });
  }

  private focusTab(id: string): void {
    const button = this.tabButtons().find(ref => ref.nativeElement.dataset['tabId'] === id);
    button?.nativeElement.focus();
  }
}

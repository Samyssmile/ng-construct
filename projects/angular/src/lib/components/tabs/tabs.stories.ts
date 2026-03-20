import { Meta, StoryObj } from '@storybook/angular';
import { Component } from '@angular/core';
import { AfTabsComponent, AfTabPanelComponent } from './tabs.component';

@Component({
  selector: 'af-tabs-story',
  standalone: true,
  imports: [AfTabsComponent, AfTabPanelComponent],
  template: `
    <ct-tabs [(activeTab)]="activeTab">
      <ct-tab-panel id="overview" label="Overview">
        <p class="ct-muted">Overview content</p>
      </ct-tab-panel>
      <ct-tab-panel id="settings" label="Settings">
        <p class="ct-muted">Settings content</p>
      </ct-tab-panel>
      <ct-tab-panel id="members" label="Members">
        <p class="ct-muted">Members content</p>
      </ct-tab-panel>
    </ct-tabs>
  `
})
class TabsStoryComponent {
  activeTab = 'overview';
}

const meta: Meta<AfTabsComponent> = {
  title: 'Angular/Tabs',
  component: AfTabsComponent,
  render: () => ({
    component: TabsStoryComponent
  })
};

export default meta;

export const Default: StoryObj<AfTabsComponent> = {};

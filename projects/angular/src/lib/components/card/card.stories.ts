import { Meta, StoryObj } from '@storybook/angular';
import { AfCardComponent } from './card.component';
import { AfButtonComponent } from '../button/button.component';

const meta: Meta<AfCardComponent> = {
  title: 'Angular/Card',
  component: AfCardComponent,
  args: {
    interactive: false
  },
  render: (args) => ({
    props: args,
    imports: [AfCardComponent, AfButtonComponent],
    template: `
      <ct-card [interactive]="interactive">
        <div header>
          <h3>Team</h3>
          <ct-button variant="ghost" size="sm">Edit</ct-button>
        </div>
        <div body>
          <p>Shared ownership and clear permissions.</p>
          <p class="ct-muted">Updated 2 days ago</p>
        </div>
        <div footer>
          <span class="ct-muted">12 members</span>
          <ct-button variant="secondary" size="sm">Open</ct-button>
        </div>
      </ct-card>
    `
  })
};

export default meta;

export const Default: StoryObj<AfCardComponent> = {};

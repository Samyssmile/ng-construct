import { Meta, StoryObj } from '@storybook/angular';
import { AfAlertComponent } from './alert.component';

const meta: Meta<AfAlertComponent> = {
  title: 'Angular/Alert',
  component: AfAlertComponent,
  args: {
    variant: 'info',
    dismissible: false,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'success', 'warning', 'danger'],
    },
    dismissible: {
      control: 'boolean',
    },
  },
  render: (args) => ({
    props: { ...args, dismissed: () => console.log('Alert dismissed') },
    template: `
      <af-alert
        [variant]="variant"
        [dismissible]="dismissible"
        (dismissed)="dismissed()">
        This is an informational alert message.
      </af-alert>
    `,
  }),
};

export default meta;

export const Default: StoryObj<AfAlertComponent> = {};

export const Success: StoryObj<AfAlertComponent> = {
  args: { variant: 'success' },
  render: (args) => ({
    props: args,
    template: `
      <af-alert [variant]="variant" [dismissible]="dismissible">
        Operation completed successfully.
      </af-alert>
    `,
  }),
};

export const Warning: StoryObj<AfAlertComponent> = {
  args: { variant: 'warning' },
  render: (args) => ({
    props: args,
    template: `
      <af-alert [variant]="variant" [dismissible]="dismissible">
        Please review the pending changes before continuing.
      </af-alert>
    `,
  }),
};

export const Danger: StoryObj<AfAlertComponent> = {
  args: { variant: 'danger' },
  render: (args) => ({
    props: args,
    template: `
      <af-alert [variant]="variant" [dismissible]="dismissible">
        An error occurred while processing your request.
      </af-alert>
    `,
  }),
};

export const Dismissible: StoryObj<AfAlertComponent> = {
  args: { variant: 'info', dismissible: true },
  render: (args) => ({
    props: { ...args, dismissed: () => console.log('Alert dismissed') },
    template: `
      <af-alert
        [variant]="variant"
        [dismissible]="dismissible"
        (dismissed)="dismissed()">
        This alert can be dismissed by clicking the close button.
      </af-alert>
    `,
  }),
};

export const WithIcon: StoryObj<AfAlertComponent> = {
  args: { variant: 'warning' },
  render: (args) => ({
    props: args,
    template: `
      <af-alert [variant]="variant" [dismissible]="dismissible">
        <span icon>&#9888;</span>
        <span title>Attention needed</span>
        Your session will expire in 5 minutes.
      </af-alert>
    `,
  }),
};

export const WithActions: StoryObj<AfAlertComponent> = {
  args: { variant: 'danger', dismissible: true },
  render: (args) => ({
    props: { ...args, dismissed: () => console.log('Dismissed') },
    template: `
      <af-alert
        [variant]="variant"
        [dismissible]="dismissible"
        (dismissed)="dismissed()">
        <span icon>&#10060;</span>
        <span title>Action required</span>
        Your account has been suspended due to suspicious activity.
        <div actions>
          <button class="ct-button ct-button--secondary ct-button--sm">Contact Support</button>
          <button class="ct-button ct-button--sm">Review Activity</button>
        </div>
      </af-alert>
    `,
  }),
};

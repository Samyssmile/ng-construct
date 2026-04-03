import { Meta, StoryObj } from '@storybook/angular';
import { AfBadgeComponent } from './badge.component';

const meta: Meta<AfBadgeComponent> = {
  title: 'Angular/Badge',
  component: AfBadgeComponent,
  args: {
    variant: 'default',
    icon: '',
    dot: false,
    role: '',
    ariaLabel: '',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'info', 'success', 'warning', 'danger'],
    },
    role: {
      control: 'select',
      options: ['', 'status'],
    },
  },
  render: (args) => ({
    props: args,
    template:
      '<af-badge [variant]="variant" [icon]="icon" [dot]="dot" [role]="role" [ariaLabel]="ariaLabel">Badge</af-badge>',
  }),
};

export default meta;

export const Default: StoryObj<AfBadgeComponent> = {};

export const Info: StoryObj<AfBadgeComponent> = {
  args: { variant: 'info' },
};

export const Success: StoryObj<AfBadgeComponent> = {
  args: { variant: 'success' },
};

export const Warning: StoryObj<AfBadgeComponent> = {
  args: { variant: 'warning' },
};

export const Danger: StoryObj<AfBadgeComponent> = {
  args: { variant: 'danger' },
};

export const WithIcon: StoryObj<AfBadgeComponent> = {
  args: { variant: 'success', icon: '+' },
  render: (args) => ({
    props: args,
    template:
      '<af-badge [variant]="variant" [icon]="icon">Approved</af-badge>',
  }),
};

export const WithDot: StoryObj<AfBadgeComponent> = {
  args: { variant: 'info', dot: true },
  render: (args) => ({
    props: args,
    template:
      '<af-badge [variant]="variant" [dot]="dot">Online</af-badge>',
  }),
};

export const AllVariants: StoryObj<AfBadgeComponent> = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center">
        <af-badge>Default</af-badge>
        <af-badge variant="info">Info</af-badge>
        <af-badge variant="success">Success</af-badge>
        <af-badge variant="warning">Warning</af-badge>
        <af-badge variant="danger">Danger</af-badge>
      </div>
    `,
  }),
};

export const WithIcons: StoryObj<AfBadgeComponent> = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center">
        <af-badge variant="info" icon="i">Info</af-badge>
        <af-badge variant="success" icon="+">Approved</af-badge>
        <af-badge variant="warning" icon="!">Warning</af-badge>
        <af-badge variant="danger" icon="x">Blocked</af-badge>
      </div>
    `,
  }),
};

export const WithDots: StoryObj<AfBadgeComponent> = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center">
        <af-badge dot>Offline</af-badge>
        <af-badge variant="info" dot>Idle</af-badge>
        <af-badge variant="success" dot>Online</af-badge>
        <af-badge variant="warning" dot>Away</af-badge>
        <af-badge variant="danger" dot>Busy</af-badge>
      </div>
    `,
  }),
};

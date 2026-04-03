import { Meta, StoryObj } from '@storybook/angular';
import { AfButtonComponent } from './button.component';

const meta: Meta<AfButtonComponent> = {
  title: 'Angular/Button',
  component: AfButtonComponent,
  args: {
    variant: 'primary',
    size: 'md',
    type: 'button',
    disabled: false,
    iconOnly: false,
    ariaLabel: '',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'outline', 'danger', 'accent', 'link'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
    },
  },
  render: (args) => ({
    props: args,
    template:
      '<af-button [variant]="variant" [size]="size" [type]="type" [disabled]="disabled" [iconOnly]="iconOnly" [ariaLabel]="ariaLabel">Button</af-button>',
  }),
};

export default meta;

export const Primary: StoryObj<AfButtonComponent> = {};

export const Secondary: StoryObj<AfButtonComponent> = {
  args: { variant: 'secondary' },
};

export const Ghost: StoryObj<AfButtonComponent> = {
  args: { variant: 'ghost' },
};

export const Outline: StoryObj<AfButtonComponent> = {
  args: { variant: 'outline' },
};

export const Danger: StoryObj<AfButtonComponent> = {
  args: { variant: 'danger' },
};

export const Accent: StoryObj<AfButtonComponent> = {
  args: { variant: 'accent' },
};

export const Link: StoryObj<AfButtonComponent> = {
  args: { variant: 'link' },
};

export const Small: StoryObj<AfButtonComponent> = {
  args: { size: 'sm' },
};

export const Large: StoryObj<AfButtonComponent> = {
  args: { size: 'lg' },
};

export const Disabled: StoryObj<AfButtonComponent> = {
  args: { disabled: true },
};

export const IconOnly: StoryObj<AfButtonComponent> = {
  args: { iconOnly: true, ariaLabel: 'Search' },
  render: (args) => ({
    props: args,
    template:
      '<af-button [variant]="variant" [size]="size" [disabled]="disabled" iconOnly [ariaLabel]="ariaLabel">🔍</af-button>',
  }),
};

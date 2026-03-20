import { Meta, StoryObj } from '@storybook/angular';
import { AfButtonComponent } from './button.component';

const meta: Meta<AfButtonComponent> = {
  title: 'Angular/Button',
  component: AfButtonComponent,
  args: {
    variant: 'primary',
    size: 'md',
    type: 'button',
    disabled: false
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'outline', 'danger', 'accent', 'link']
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg']
    },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset']
    }
  },
  render: (args) => ({
    props: args,
    template: '<ct-button [variant]="variant" [size]="size" [type]="type" [disabled]="disabled">Button</ct-button>'
  })
};

export default meta;

export const Primary: StoryObj<AfButtonComponent> = {};

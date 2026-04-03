import { Meta, StoryObj } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { AfInputComponent } from './input.component';

const meta: Meta<AfInputComponent> = {
  title: 'Angular/Input',
  component: AfInputComponent,
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'name@company.com',
    hint: '',
    error: '',
    required: false,
    disabled: false,
    iconPosition: null,
  },
  argTypes: {
    type: { control: 'select', options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'] },
    iconPosition: { control: 'select', options: [null, 'left', 'right'] },
  },
  render: (args) => ({
    props: { ...args, value: '' },
    imports: [FormsModule, AfInputComponent],
    template: `
      <af-input
        [label]="label"
        [type]="type"
        [placeholder]="placeholder"
        [hint]="hint"
        [error]="error"
        [required]="required"
        [disabled]="disabled"
        [iconPosition]="iconPosition"
        [(ngModel)]="value"
      />
    `,
  }),
};

export default meta;

export const Default: StoryObj<AfInputComponent> = {};

export const WithHint: StoryObj<AfInputComponent> = {
  args: {
    hint: 'We will not share this.',
  },
};

export const WithError: StoryObj<AfInputComponent> = {
  args: {
    error: 'Please enter a valid email address.',
  },
};

export const Required: StoryObj<AfInputComponent> = {
  args: {
    required: true,
  },
};

export const Disabled: StoryObj<AfInputComponent> = {
  args: {
    disabled: true,
    placeholder: 'Cannot edit',
  },
};

export const Password: StoryObj<AfInputComponent> = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
  },
};

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
    hint: 'We will not share this.',
    error: '',
    required: false,
    disabled: false,
    iconPosition: null,
    value: ''
  },
  render: (args) => ({
    props: args,
    imports: [FormsModule, AfInputComponent],
    template: `
      <ct-input
        [label]="label"
        [type]="type"
        [placeholder]="placeholder"
        [hint]="hint"
        [error]="error"
        [required]="required"
        [disabled]="disabled"
        [iconPosition]="iconPosition"
        [(ngModel)]="value">
      </ct-input>
    `
  })
};

export default meta;

export const Default: StoryObj<AfInputComponent> = {};

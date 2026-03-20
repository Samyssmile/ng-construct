import { Meta, StoryObj } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { AfSelectComponent, AfSelectOption } from './select.component';

const options: AfSelectOption[] = [
  { value: 'designer', label: 'Designer' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'manager', label: 'Manager' }
];

const meta: Meta<AfSelectComponent> = {
  title: 'Angular/Select',
  component: AfSelectComponent,
  args: {
    label: 'Role',
    placeholder: 'Choose a role',
    options,
    hint: '',
    error: '',
    required: false,
    disabled: false,
    value: null
  },
  render: (args) => ({
    props: args,
    imports: [FormsModule, AfSelectComponent],
    template: `
      <ct-select
        [label]="label"
        [placeholder]="placeholder"
        [options]="options"
        [hint]="hint"
        [error]="error"
        [required]="required"
        [disabled]="disabled"
        [(ngModel)]="value">
      </ct-select>
    `
  })
};

export default meta;

export const Default: StoryObj<AfSelectComponent> = {};

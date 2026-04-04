import { Meta, StoryObj } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { AfSelectComponent, AfSelectOption } from './select.component';

const options: AfSelectOption[] = [
  { value: 'designer', label: 'Designer' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'manager', label: 'Manager' },
  { value: 'analyst', label: 'Analyst' },
  { value: 'lead', label: 'Lead' },
];

const optionsWithDisabled: AfSelectOption[] = [
  { value: 'designer', label: 'Designer' },
  { value: 'engineer', label: 'Engineer', disabled: true },
  { value: 'manager', label: 'Manager' },
  { value: 'analyst', label: 'Analyst', disabled: true },
  { value: 'lead', label: 'Lead' },
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
    size: 'md',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  render: (args) => ({
    props: { ...args, value: null },
    imports: [FormsModule, AfSelectComponent],
    template: `
      <af-select
        [label]="label"
        [placeholder]="placeholder"
        [options]="options"
        [hint]="hint"
        [error]="error"
        [required]="required"
        [disabled]="disabled"
        [size]="size"
        [(ngModel)]="value">
      </af-select>
    `,
  }),
};

export default meta;

export const Default: StoryObj<AfSelectComponent> = {};

export const WithHint: StoryObj<AfSelectComponent> = {
  args: { hint: 'Choose your primary role' },
};

export const WithError: StoryObj<AfSelectComponent> = {
  args: { error: 'This field is required' },
};

export const Required: StoryObj<AfSelectComponent> = {
  args: { required: true },
};

export const Disabled: StoryObj<AfSelectComponent> = {
  args: { disabled: true },
};

export const Small: StoryObj<AfSelectComponent> = {
  args: { size: 'sm' },
};

export const Large: StoryObj<AfSelectComponent> = {
  args: { size: 'lg' },
};

export const WithDisabledOptions: StoryObj<AfSelectComponent> = {
  args: { options: optionsWithDisabled },
};

export const NoLabel: StoryObj<AfSelectComponent> = {
  args: { label: '' },
};

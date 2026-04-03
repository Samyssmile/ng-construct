import { Meta, StoryObj } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { AfSelectMenuComponent, AfSelectMenuOption } from './select-menu.component';

const options: AfSelectMenuOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'mango', label: 'Mango' },
  { value: 'strawberry', label: 'Strawberry' },
];

const optionsWithDisabled: AfSelectMenuOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana', disabled: true },
  { value: 'cherry', label: 'Cherry' },
  { value: 'mango', label: 'Mango', disabled: true },
  { value: 'strawberry', label: 'Strawberry' },
];

const meta: Meta<AfSelectMenuComponent> = {
  title: 'Angular/SelectMenu',
  component: AfSelectMenuComponent,
  args: {
    label: 'Fruit',
    placeholder: 'Select a fruit',
    options,
    hint: '',
    error: '',
    required: false,
    disabled: false,
    multiple: false,
    size: 'md',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    multiple: { control: 'boolean' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  render: (args) => ({
    props: { ...args, value: null },
    imports: [FormsModule, AfSelectMenuComponent],
    template: `
      <af-select-menu
        [label]="label"
        [placeholder]="placeholder"
        [options]="options"
        [hint]="hint"
        [error]="error"
        [required]="required"
        [disabled]="disabled"
        [multiple]="multiple"
        [size]="size"
        [(ngModel)]="value">
      </af-select-menu>
    `,
  }),
};

export default meta;

export const Default: StoryObj<AfSelectMenuComponent> = {};

export const WithHint: StoryObj<AfSelectMenuComponent> = {
  args: { hint: 'Choose your favorite fruit' },
};

export const WithError: StoryObj<AfSelectMenuComponent> = {
  args: { error: 'This field is required' },
};

export const Required: StoryObj<AfSelectMenuComponent> = {
  args: { required: true },
};

export const Disabled: StoryObj<AfSelectMenuComponent> = {
  args: { disabled: true },
};

export const MultiSelect: StoryObj<AfSelectMenuComponent> = {
  args: { multiple: true, placeholder: 'Select fruits' },
  render: (args) => ({
    props: { ...args, value: [] },
    imports: [FormsModule, AfSelectMenuComponent],
    template: `
      <af-select-menu
        [label]="label"
        [placeholder]="placeholder"
        [options]="options"
        [hint]="hint"
        [error]="error"
        [required]="required"
        [disabled]="disabled"
        [multiple]="multiple"
        [size]="size"
        [(ngModel)]="value">
      </af-select-menu>
    `,
  }),
};

export const Small: StoryObj<AfSelectMenuComponent> = {
  args: { size: 'sm' },
};

export const Large: StoryObj<AfSelectMenuComponent> = {
  args: { size: 'lg' },
};

export const WithDisabledOptions: StoryObj<AfSelectMenuComponent> = {
  args: { options: optionsWithDisabled },
};

export const NoLabel: StoryObj<AfSelectMenuComponent> = {
  args: { label: '' },
};

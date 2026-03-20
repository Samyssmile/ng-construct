import { Meta, StoryObj } from '@storybook/angular';
import { AfDropdownComponent, AfDropdownItem } from './dropdown.component';

const items: AfDropdownItem[] = [
  { label: 'Edit', value: 'edit' },
  { label: 'Duplicate', value: 'duplicate' },
  { label: '---', value: null, separator: true },
  { label: 'Archive', value: 'archive' }
];

const meta: Meta<AfDropdownComponent> = {
  title: 'Angular/Dropdown',
  component: AfDropdownComponent,
  args: {
    label: 'Actions',
    items
  },
  render: (args) => ({
    props: args,
    imports: [AfDropdownComponent],
    template: `
      <ct-dropdown [label]="label" [items]="items"></ct-dropdown>
    `
  })
};

export default meta;

export const Default: StoryObj<AfDropdownComponent> = {};

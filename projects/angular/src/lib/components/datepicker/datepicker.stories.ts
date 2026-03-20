import { Meta, StoryObj } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { AfDatepickerComponent } from './datepicker.component';

const meta: Meta<AfDatepickerComponent> = {
  title: 'Angular/Datepicker',
  component: AfDatepickerComponent,
  args: {
    label: 'Select date',
    placeholder: 'Pick a date',
    disabled: false,
    dateFormat: 'MMM dd, yyyy',
    value: null
  },
  render: (args) => ({
    props: args,
    imports: [FormsModule, AfDatepickerComponent],
    template: `
      <ct-datepicker
        [label]="label"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [dateFormat]="dateFormat"
        [(ngModel)]="value">
      </ct-datepicker>
    `
  })
};

export default meta;

export const Default: StoryObj<AfDatepickerComponent> = {};

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
  },
  render: (args) => ({
    props: {
      ...args,
      value: null,
    },
    imports: [FormsModule, AfDatepickerComponent],
    template: `
      <af-datepicker
        [label]="label"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [dateFormat]="dateFormat"
        [hint]="hint"
        [error]="error"
        [required]="required"
        [(ngModel)]="value">
      </af-datepicker>
    `,
  }),
};

export default meta;

export const Default: StoryObj<AfDatepickerComponent> = {};

export const WithHint: StoryObj<AfDatepickerComponent> = {
  args: {
    hint: 'Select your preferred date',
  },
};

export const WithError: StoryObj<AfDatepickerComponent> = {
  args: {
    error: 'This field is required',
  },
};

export const Required: StoryObj<AfDatepickerComponent> = {
  args: {
    required: true,
  },
};

export const Disabled: StoryObj<AfDatepickerComponent> = {
  args: {
    disabled: true,
  },
};

export const WithMinMax: StoryObj<AfDatepickerComponent> = {
  args: {
    label: 'Booking date',
    hint: 'Select a date within the next 30 days',
  },
  render: (args) => ({
    props: {
      ...args,
      value: null,
      min: new Date(),
      max: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    imports: [FormsModule, AfDatepickerComponent],
    template: `
      <af-datepicker
        [label]="label"
        [hint]="hint"
        [min]="min"
        [max]="max"
        [(ngModel)]="value">
      </af-datepicker>
    `,
  }),
};

export const WeekdaysOnly: StoryObj<AfDatepickerComponent> = {
  args: {
    label: 'Business date',
    hint: 'Only weekdays are selectable',
  },
  render: (args) => ({
    props: {
      ...args,
      value: null,
      dateFilter: (date: Date) => date.getDay() !== 0 && date.getDay() !== 6,
    },
    imports: [FormsModule, AfDatepickerComponent],
    template: `
      <af-datepicker
        [label]="label"
        [hint]="hint"
        [dateFilter]="dateFilter"
        [(ngModel)]="value">
      </af-datepicker>
    `,
  }),
};

export const RangeMode: StoryObj<AfDatepickerComponent> = {
  args: {
    label: 'Date range',
    placeholder: 'Start – End',
  },
  render: (args) => ({
    props: {
      ...args,
      value: null,
    },
    imports: [FormsModule, AfDatepickerComponent],
    template: `
      <af-datepicker
        [label]="label"
        [placeholder]="placeholder"
        mode="range"
        [(ngModel)]="value">
      </af-datepicker>
    `,
  }),
};

export const IsoFormat: StoryObj<AfDatepickerComponent> = {
  args: {
    label: 'Date (ISO)',
    hint: 'Value is emitted as ISO string',
  },
  render: (args) => ({
    props: {
      ...args,
      value: null,
    },
    imports: [FormsModule, AfDatepickerComponent],
    template: `
      <af-datepicker
        [label]="label"
        [hint]="hint"
        valueFormat="iso"
        [(ngModel)]="value">
      </af-datepicker>
      <p style="margin-top: 1rem; font-size: 0.875rem; color: var(--color-text-muted)">
        Value: {{ value | json }}
      </p>
    `,
  }),
};

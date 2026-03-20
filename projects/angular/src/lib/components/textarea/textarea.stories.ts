import { Meta, StoryObj } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { AfTextareaComponent } from './textarea.component';

const meta: Meta<AfTextareaComponent> = {
  title: 'Angular/Textarea',
  component: AfTextareaComponent,
  args: {
    label: 'Notes',
    placeholder: 'Add details...',
    hint: '',
    error: '',
    required: false,
    disabled: false,
    rows: 4,
    value: ''
  },
  render: (args) => ({
    props: args,
    imports: [FormsModule, AfTextareaComponent],
    template: `
      <ct-textarea
        [label]="label"
        [placeholder]="placeholder"
        [hint]="hint"
        [error]="error"
        [required]="required"
        [disabled]="disabled"
        [rows]="rows"
        [(ngModel)]="value">
      </ct-textarea>
    `
  })
};

export default meta;

export const Default: StoryObj<AfTextareaComponent> = {};

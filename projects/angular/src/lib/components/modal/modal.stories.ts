import { Meta, StoryObj } from '@storybook/angular';
import { Component } from '@angular/core';
import { AfModalComponent } from './modal.component';
import { AfButtonComponent } from '../button/button.component';

@Component({
  selector: 'af-modal-story',
  standalone: true,
  imports: [AfModalComponent, AfButtonComponent],
  template: `
    <ct-button (clicked)="open = true">Open modal</ct-button>
    <ct-modal [open]="open" title="Confirm action" (closed)="open = false">
      <div body>
        <p>Are you sure you want to continue?</p>
      </div>
      <div footer>
        <ct-button variant="secondary" (clicked)="open = false">Cancel</ct-button>
        <ct-button (clicked)="open = false">Confirm</ct-button>
      </div>
    </ct-modal>
  `
})
class ModalStoryComponent {
  open = true;
}

const meta: Meta<AfModalComponent> = {
  title: 'Angular/Modal',
  component: AfModalComponent,
  render: () => ({
    component: ModalStoryComponent
  })
};

export default meta;

export const Default: StoryObj<AfModalComponent> = {};

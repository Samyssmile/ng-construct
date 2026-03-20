import { Meta, StoryObj } from '@storybook/angular';
import { Component } from '@angular/core';
import { AfToastContainerComponent } from './toast.component';
import { AfToastService } from '../../services/toast.service';
import { AfButtonComponent } from '../button/button.component';

@Component({
  selector: 'af-toast-story',
  standalone: true,
  imports: [AfToastContainerComponent, AfButtonComponent],
  template: `
    <ct-toast-container></ct-toast-container>
    <ct-button (clicked)="showToast()">Show toast</ct-button>
  `
})
class ToastStoryComponent {
  constructor(private toast: AfToastService) {
    this.toast.success('Saved', 'Your changes were saved.');
  }

  showToast(): void {
    this.toast.info('Info', 'This is a notification.');
  }
}

const meta: Meta<AfToastContainerComponent> = {
  title: 'Angular/Toast',
  component: AfToastContainerComponent,
  render: () => ({
    component: ToastStoryComponent
  })
};

export default meta;

export const Default: StoryObj<AfToastContainerComponent> = {};

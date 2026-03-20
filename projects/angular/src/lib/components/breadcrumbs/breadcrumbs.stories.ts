import { Meta, StoryObj } from '@storybook/angular';
import { AfBreadcrumbsComponent, AfBreadcrumb } from './breadcrumbs.component';

const items: AfBreadcrumb[] = [
  { label: 'Home', url: '#' },
  { label: 'Projects', url: '#' },
  { label: 'Alpha' }
];

const meta: Meta<AfBreadcrumbsComponent> = {
  title: 'Angular/Breadcrumbs',
  component: AfBreadcrumbsComponent,
  args: {
    items
  },
  render: (args) => ({
    props: args,
    imports: [AfBreadcrumbsComponent],
    template: '<ct-breadcrumbs [items]="items"></ct-breadcrumbs>'
  })
};

export default meta;

export const Default: StoryObj<AfBreadcrumbsComponent> = {};

import { Meta, StoryObj } from '@storybook/angular';
import { AfPaginationComponent } from './pagination.component';

const meta: Meta<AfPaginationComponent> = {
  title: 'Angular/Pagination',
  component: AfPaginationComponent,
  args: {
    currentPage: 2,
    totalPages: 10,
    previousLabel: 'Prev',
    nextLabel: 'Next',
    maxVisiblePages: 7
  },
  render: (args) => ({
    props: args,
    imports: [AfPaginationComponent],
    template: `
      <ct-pagination
        [currentPage]="currentPage"
        [totalPages]="totalPages"
        [previousLabel]="previousLabel"
        [nextLabel]="nextLabel"
        [maxVisiblePages]="maxVisiblePages">
      </ct-pagination>
    `
  })
};

export default meta;

export const Default: StoryObj<AfPaginationComponent> = {};

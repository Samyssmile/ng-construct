import { Meta, StoryObj } from '@storybook/angular';
import { AfDataTableComponent, AfColumn } from './data-table.component';

const rows = [
  { id: 1, name: 'Alpha', status: 'Active', owner: 'J. Chen' },
  { id: 2, name: 'Beta', status: 'Paused', owner: 'L. Hart' },
  { id: 3, name: 'Gamma', status: 'Active', owner: 'S. Rivera' }
];

const columns: AfColumn[] = [
  { key: 'name', header: 'Project', sortable: true },
  { key: 'status', header: 'Status', sortable: true },
  { key: 'owner', header: 'Owner' }
];

const meta: Meta<AfDataTableComponent> = {
  title: 'Angular/Data Table',
  component: AfDataTableComponent,
  args: {
    data: rows,
    columns,
    rowId: 'id'
  },
  render: (args) => ({
    props: args,
    imports: [AfDataTableComponent],
    template: `
      <ct-data-table
        [data]="data"
        [columns]="columns"
        [rowId]="rowId">
      </ct-data-table>
    `
  })
};

export default meta;

export const Default: StoryObj<AfDataTableComponent> = {};

import { Meta, StoryObj } from '@storybook/angular';
import { AfBarChartComponent } from './bar-chart.component';

const statuses = ['Open', 'Doing', 'Review', 'Done'];
const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'];

const meta: Meta<AfBarChartComponent> = {
  title: 'Angular/Charts/Bar Chart',
  component: AfBarChartComponent,
  args: {
    ariaLabel: 'Tickets by status',
    categories: statuses,
    series: [{ name: 'Tickets', values: [12, 8, 5, 20] }],
    layout: 'grouped',
    orientation: 'vertical',
    histogram: false,
    showLegend: true,
    showLegendForSingle: false,
    height: 280,
  },
  argTypes: {
    layout: { control: 'inline-radio', options: ['grouped', 'stacked'] },
    orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    histogram: { control: 'boolean' },
    showLegend: { control: 'boolean' },
    showLegendForSingle: { control: 'boolean' },
    height: { control: { type: 'number', min: 160, max: 480, step: 20 } },
  },
};

export default meta;
type Story = StoryObj<AfBarChartComponent>;

export const Default: Story = {};

export const Grouped: Story = {
  args: {
    ariaLabel: 'Cost by origin and week',
    categories: weeks,
    series: [
      { name: 'Analyzer', values: [400, 520, 480, 610, 580, 700] },
      { name: 'Resolver', values: [800, 900, 1050, 1200, 1150, 1400] },
    ],
    layout: 'grouped',
  },
};

export const Stacked: Story = {
  args: {
    ariaLabel: 'Cost by origin and week (stacked)',
    categories: weeks,
    series: [
      { name: 'Analyzer', values: [400, 520, 480, 610, 580, 700] },
      { name: 'Resolver', values: [800, 900, 1050, 1200, 1150, 1400] },
    ],
    layout: 'stacked',
  },
};

export const Horizontal: Story = {
  args: {
    ariaLabel: 'Top organisations by documents',
    categories: ['Acme Corp', 'Globex', 'Initech', 'Umbrella', 'Soylent'],
    series: [{ name: 'Documents', values: [320, 280, 210, 160, 90] }],
    orientation: 'horizontal',
  },
};

export const Histogram: Story = {
  args: {
    ariaLabel: 'Response-time distribution (ms)',
    categories: ['0–50', '50–100', '100–150', '150–200', '200–250', '250–300'],
    series: [{ name: 'Requests', values: [12, 34, 58, 41, 22, 7] }],
    histogram: true,
  },
};

export const NoData: Story = {
  args: { series: [{ name: 'Tickets', values: [] }], categories: [] },
};

export const TableVisible: Story = {
  args: { showTableInitially: true },
};

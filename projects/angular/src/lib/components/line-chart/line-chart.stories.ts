import { Meta, StoryObj } from '@storybook/angular';
import { AfLineChartComponent } from './line-chart.component';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const meta: Meta<AfLineChartComponent> = {
  title: 'Angular/Charts/Line Chart',
  component: AfLineChartComponent,
  args: {
    ariaLabel: 'Revenue, last 7 days',
    categories: days,
    series: [{ name: 'Revenue', values: [1200, 1900, 1700, 2400, 2100, 2600, 3000] }],
    area: false,
    showDots: true,
    showLegend: true,
    height: 280,
  },
  argTypes: {
    area: { control: 'boolean' },
    showDots: { control: 'boolean' },
    showLegend: { control: 'boolean' },
    height: { control: { type: 'number', min: 160, max: 480, step: 20 } },
  },
};

export default meta;
type Story = StoryObj<AfLineChartComponent>;

export const Default: Story = {};

export const Area: Story = {
  args: { area: true },
};

export const MultiSeries: Story = {
  args: {
    ariaLabel: 'AI cost by origin, last 7 days',
    series: [
      { name: 'Analyzer', values: [400, 520, 480, 610, 580, 700, 760] },
      { name: 'Resolver', values: [800, 900, 1050, 1200, 1150, 1400, 1500] },
    ],
    area: true,
  },
};

export const WithGaps: Story = {
  args: {
    ariaLabel: 'Pages processed (with missing days)',
    series: [{ name: 'Pages', values: [120, 180, null, null, 240, 300, 280] }],
  },
};

export const NoData: Story = {
  args: { series: [{ name: 'Revenue', values: [] }], categories: [] },
};

export const TableVisible: Story = {
  args: { showTableInitially: true },
};

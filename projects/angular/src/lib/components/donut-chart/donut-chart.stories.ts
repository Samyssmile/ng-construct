import { Meta, StoryObj } from '@storybook/angular';
import { AfDonutChartComponent } from './donut-chart.component';
import { AfChartDatum } from '../chart/chart.types';

const contractMix: AfChartDatum[] = [
  { label: 'Enterprise', value: 60 },
  { label: 'Team', value: 30 },
  { label: 'Starter', value: 10 },
];

const meta: Meta<AfDonutChartComponent> = {
  title: 'Angular/Charts/Donut Chart',
  component: AfDonutChartComponent,
  args: {
    ariaLabel: 'Contract mix by plan',
    data: contractMix,
    innerRadiusRatio: 0.6,
    centerLabel: '',
    centerValue: '',
    showLegend: true,
    showPercentInLegend: true,
    height: 260,
  },
  argTypes: {
    innerRadiusRatio: { control: { type: 'number', min: 0, max: 0.9, step: 0.05 } },
    showLegend: { control: 'boolean' },
    showPercentInLegend: { control: 'boolean' },
    height: { control: { type: 'number', min: 160, max: 480, step: 20 } },
  },
};

export default meta;
type Story = StoryObj<AfDonutChartComponent>;

export const Default: Story = {};

export const Pie: Story = {
  args: { innerRadiusRatio: 0 },
};

export const WithCenterLabel: Story = {
  args: { centerLabel: 'Contracts', centerValue: '100' },
};

export const NoData: Story = {
  args: { data: [] },
};

export const TableVisible: Story = {
  args: { showTableInitially: true },
};

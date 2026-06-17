import { Meta, StoryObj } from '@storybook/angular';
import { AfGaugeComponent } from './gauge.component';
import { AfGaugeThreshold } from '../chart/chart.types';

const utilisationThresholds: AfGaugeThreshold[] = [
  { from: 0, status: 'danger' },
  { from: 50, status: 'warning' },
  { from: 80, status: 'success' },
];

const meta: Meta<AfGaugeComponent> = {
  title: 'Angular/Charts/Gauge',
  component: AfGaugeComponent,
  args: {
    ariaLabel: 'Compliance score',
    value: 82,
    min: 0,
    max: 100,
    thresholds: [],
    status: 'default',
    shape: 'ring',
    valueText: '82%',
    caption: '',
    strokeWidth: 14,
    showValue: true,
    height: 200,
  },
  argTypes: {
    status: { control: 'select', options: ['default', 'success', 'warning', 'danger'] },
    shape: { control: 'inline-radio', options: ['ring', 'semi'] },
    showValue: { control: 'boolean' },
    strokeWidth: { control: { type: 'number', min: 4, max: 40, step: 2 } },
    height: { control: { type: 'number', min: 120, max: 360, step: 20 } },
  },
};

export default meta;
type Story = StoryObj<AfGaugeComponent>;

export const Default: Story = {};

export const Semi: Story = {
  args: { shape: 'semi' },
};

export const WithThresholds: Story = {
  args: {
    ariaLabel: 'Quota utilisation',
    value: 92,
    valueText: '92%',
    caption: 'Utilisation',
    thresholds: utilisationThresholds,
  },
};

export const Caption: Story = {
  args: { caption: 'Compliance' },
};

export const NoData: Story = {
  args: { value: 0, min: 0, max: 0 },
};

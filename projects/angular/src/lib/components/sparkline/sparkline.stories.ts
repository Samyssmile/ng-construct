import { Meta, StoryObj } from '@storybook/angular';
import { AfSparklineComponent } from './sparkline.component';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const meta: Meta<AfSparklineComponent> = {
  title: 'Angular/Charts/Sparkline',
  component: AfSparklineComponent,
  args: {
    ariaLabel: 'Sign-ups, last 7 days',
    values: [12, 19, 17, 24, 21, 26, 30],
    categories: days,
    area: false,
    showLastDot: true,
    width: 120,
    height: 32,
  },
  argTypes: {
    area: { control: 'boolean' },
    showLastDot: { control: 'boolean' },
    color: { control: 'color' },
    width: { control: { type: 'number', min: 60, max: 320, step: 10 } },
    height: { control: { type: 'number', min: 16, max: 96, step: 4 } },
  },
};

export default meta;
type Story = StoryObj<AfSparklineComponent>;

export const Default: Story = {};

export const Area: Story = {
  args: { area: true },
};

export const NoDot: Story = {
  args: { showLastDot: false },
};

export const SinglePoint: Story = {
  args: {
    ariaLabel: 'Current value',
    values: [42],
    categories: ['Now'],
  },
};

export const NoData: Story = {
  args: { values: [], categories: [] },
};

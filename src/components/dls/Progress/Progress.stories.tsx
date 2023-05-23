import Progress from './index';

export default {
  title: 'dls/Progress',
  component: Progress,
  argTypes: {
    value: {
      control: {
        type: 'range',
        min: 1,
        max: 100,
        step: 1,
      },
      defaultValue: 25,
    },
  },
};

export const Default = (args) => <Progress {...args} />;

import Pill, { PillSize } from './index';

export default {
  title: 'dls/Pill',
  component: Pill,
  argTypes: {
    size: {
      control: 'radio',
      options: Object.values(PillSize),
      description: 'The value that will be used with aria-label',
      table: {
        category: 'Optional',
      },
    },
  },
};

const Template = (args) => <Pill {...args} />;

export const MediumSizedPill = Template.bind({});
MediumSizedPill.args = {
  children: 'COMPLETED',
  size: PillSize.MEDIUM,
};

export const SmallSizedPill = Template.bind({});
SmallSizedPill.args = {
  children: 'COMPLETED',
  size: PillSize.SMALL,
};

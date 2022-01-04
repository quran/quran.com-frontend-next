/* eslint-disable react/no-multi-comp */
import Spinner, { SpinnerSize } from './Spinner';

export default {
  title: 'dls/Spinner',
  component: Spinner,
  args: {
    size: SpinnerSize.Medium,
  },
  argTypes: {
    size: {
      description: `[OPTIONAL] The size of the button`,
      options: Object.values(SpinnerSize),
      control: { type: 'radio' },
      defaultValue: SpinnerSize.Medium,
    },
    isCentered: {
      control: { type: 'boolean' },
      defaultValue: true,
    },
  },
};

const PreviewTemplate = (args) => <Spinner {...args} />;
export const Preview = PreviewTemplate.bind({});

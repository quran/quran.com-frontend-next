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
    },
  },
};

export const Small = () => <Spinner size={SpinnerSize.Small} />;
export const Medium = () => <Spinner size={SpinnerSize.Medium} />;
export const Large = () => <Spinner size={SpinnerSize.Large} />;

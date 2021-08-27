import Spinner, { SpinnerSize } from './Spinner';

export default {
  title: 'dls/Popover',
  component: Spinner,
};

export const Small = () => <Spinner size={SpinnerSize.Small} />;
export const Medium = () => <Spinner size={SpinnerSize.Medium} />;
export const Large = () => <Spinner size={SpinnerSize.Large} />;

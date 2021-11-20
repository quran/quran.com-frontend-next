/* eslint-disable react/no-multi-comp */
import Skeleton from './Skeleton';

import Button from 'src/components/dls/Button/Button';

export default {
  title: 'dls/Skeleton',
  component: Skeleton,
};

export const Normal = () => <Skeleton />;
export const Rounded = () => <Skeleton isRounded />;
export const Squared = () => <Skeleton isSquared />;

export const WrappingAChildren = () => (
  <div style={{ display: 'flex' }}>
    <Skeleton>
      <Button>I am a button</Button>
    </Skeleton>
  </div>
);

export const WrappingAChildrenNotActive = () => (
  <div style={{ display: 'flex' }}>
    <Skeleton isActive={false}>
      <Button>I am a button</Button>
    </Skeleton>
  </div>
);

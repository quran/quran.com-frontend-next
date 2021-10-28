/* eslint-disable react/no-multi-comp */
import Skeleton from './Skeleton';

import Button from 'src/components/dls/Button/Button';

export default {
  title: 'dls/skeleton',
  component: Skeleton,
};

export const Normal = () => (
  <div style={{ width: 160 }}>
    <Skeleton />
  </div>
);

export const Rounded = () => (
  <div>
    <Skeleton isRounded />
  </div>
);

export const Squared = () => (
  <div>
    <Skeleton isSquared />
  </div>
);

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

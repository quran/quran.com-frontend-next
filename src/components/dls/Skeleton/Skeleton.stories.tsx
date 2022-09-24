/* eslint-disable react/no-multi-comp */
import Skeleton from './Skeleton';

import Button from '@/dls/Button/Button';

export default {
  title: 'dls/Skeleton',
  component: Skeleton,
  argTypes: {
    children: {
      table: {
        category: 'Optional',
      },
    },
    isRounded: {
      control: {
        type: 'boolean',
      },
      table: {
        category: 'Optional',
      },
      defaultValue: false,
    },
    isSquared: {
      control: {
        type: 'boolean',
      },
      table: {
        category: 'Optional',
      },
      defaultValue: false,
    },
    isActive: {
      control: {
        type: 'boolean',
      },
      table: {
        category: 'Optional',
      },
      defaultValue: true,
    },
    style: {
      table: {
        category: 'Optional',
      },
    },
    className: {
      table: {
        category: 'Optional',
      },
    },
  },
};

export const Normal = (args) => <Skeleton {...args} />;

export const WrappingAChildren = (args) => (
  <div style={{ display: 'flex' }}>
    <Skeleton {...args}>
      <Button>I am a button</Button>
    </Skeleton>
  </div>
);

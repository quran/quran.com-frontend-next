/* eslint-disable react/no-multi-comp */
import Separator, { SeparatorWeight } from './Separator';
import styles from './Separator.stories.module.scss';

export default {
  title: 'dls/Separator',
  component: Separator,
  args: {
    weight: SeparatorWeight.SemiBold,
  },
  argTypes: {
    isVertical: {
      control: {
        type: 'boolean',
      },
      table: {
        category: 'Optional',
      },
    },
    weight: {
      table: {
        category: 'Optional',
      },
      options: [SeparatorWeight.SemiBold, SeparatorWeight.Bold],
      control: { type: 'radio' },
      description: 'The weight of the separator line.',
    },
  },
};

export const Horizontal = (args) => (
  <div className="previewWrapper">
    <h1>aa</h1>
    <div className={styles.horizontalSeparator}>
      <Separator {...args} />
    </div>
    <h1>aa</h1>
  </div>
);

export const Vertical = (args) => (
  <div style={{ display: 'flex', height: '30px', alignItems: 'center' }} className="previewWrapper">
    <h1>aa</h1>
    <div className={styles.verticalSeparator}>
      <Separator {...args} isVertical />
    </div>
    <h1>aa</h1>
  </div>
);

/* eslint-disable react/no-multi-comp */
import Separator from './Separator';
import styles from './Separator.stories.module.scss';

export default {
  title: 'dls/Separator',
  component: Separator,
  argTypes: {
    isVertical: {
      control: {
        type: 'boolean',
      },
      table: {
        category: 'Optional',
      },
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

import Separator from './Separator';
import styles from './Separator.stories.module.scss';

export default {
  title: 'dls/Separator',
  component: Separator,
};

export const Horizontal = () => (
  <div>
    <h1>aa</h1>
    <div className={styles.horizontalSeparator}>
      <Separator />
    </div>
    <h1>aa</h1>
  </div>
);

export const Vertical = () => (
  <div style={{ display: 'flex', height: '30px', alignItems: 'center' }}>
    <h1>aa</h1>
    <div className={styles.verticalSeparator}>
      <Separator vertical />
    </div>
    <h1>aa</h1>
  </div>
);

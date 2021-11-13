import Skeleton from '../../dls/Skeleton/Skeleton';

import styles from './SettingsBodySkeleton.module.scss';

const SETTINGS_ROW_COUNT = 4;
const rowsArr = Array(SETTINGS_ROW_COUNT).fill(null);

const SettingsBodySkeleton = () => {
  return (
    <span className={styles.skeletonContainer}>
      {rowsArr.map((k, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <span key={`skeleton_${i}`} className={styles.inputRow}>
          <div className={styles.title}>
            <Skeleton isActive isSquared className={styles.titleSkeleton} />
          </div>
          <div className={styles.rowSkeleton}>
            <Skeleton isActive isSquared className={styles.label} />
            <Skeleton isActive isSquared className={styles.input} />
          </div>
        </span>
      ))}
    </span>
  );
};

export default SettingsBodySkeleton;

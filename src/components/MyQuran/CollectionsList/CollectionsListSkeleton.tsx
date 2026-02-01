import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './CollectionsList.module.scss';

const CollectionsListSkeleton: React.FC = () => {
  const { t } = useTranslation('my-quran');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>{t('collections.title')}</h3>
        <div className={styles.sortSkeleton} />
      </div>
      <div className={styles.listContainer}>
        <div className={styles.list}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      </div>
    </div>
  );
};
export default CollectionsListSkeleton;

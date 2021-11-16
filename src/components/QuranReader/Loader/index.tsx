import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './Loader.module.scss';

import Button from 'src/components/dls/Button/Button';

interface Props {
  isValidating: boolean;
  loadMore: () => void;
  renderSkeletonComponent: () => React.ReactNode;
}

const Loader: React.FC<Props> = ({ isValidating, loadMore, renderSkeletonComponent }) => {
  const { t } = useTranslation('quran-reader');
  return (
    <div className={styles.loadMoreContainer}>
      {isValidating ? (
        renderSkeletonComponent()
      ) : (
        <Button onClick={loadMore} disabled={isValidating}>
          {t('load-more')}
        </Button>
      )}
    </div>
  );
};

export default Loader;

import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import Spinner, { SpinnerSize } from '../../dls/Spinner/Spinner';

import styles from './Loader.module.scss';

import Button from 'src/components/dls/Button/Button';

interface Props {
  isValidating: boolean;
  loadMore: () => void;
}

const Loader: React.FC<Props> = ({ isValidating, loadMore }) => {
  const { t } = useTranslation('quran-reader');
  return (
    <div className={styles.loadMoreContainer}>
      {isValidating ? (
        <Spinner size={SpinnerSize.Large} />
      ) : (
        <Button onClick={loadMore} disabled={isValidating}>
          {t('load-more')}
        </Button>
      )}
    </div>
  );
};

export default Loader;

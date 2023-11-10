import React from 'react';

import styles from './LazyLoadingSpinner.module.scss';

import Spinner from '@/dls/Spinner/Spinner';

type Props = {};

const LazyLoadingSpinner = (props: Props) => {
  return (
    <div className={styles.loadingContainer}>
      <Spinner />
    </div>
  );
};

export default LazyLoadingSpinner;

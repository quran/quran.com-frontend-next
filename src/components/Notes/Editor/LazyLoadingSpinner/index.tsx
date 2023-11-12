import React from 'react';

import styles from './LazyLoadingSpinner.module.scss';

import Spinner from '@/dls/Spinner/Spinner';

const LazyLoadingSpinner = () => {
  return (
    <div className={styles.loadingContainer}>
      <Spinner />
    </div>
  );
};

export default LazyLoadingSpinner;

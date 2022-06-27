import React from 'react';

import styles from './Title.module.scss';

import Spinner from 'src/components/dls/Spinner/Spinner';

const Title = ({ children, isLoading = false }) => {
  return (
    <div className={styles.title}>
      <div className={styles.internalContainer}>
        {children}
        {isLoading && <Spinner className={styles.spinner} />}
      </div>
    </div>
  );
};

export default Title;

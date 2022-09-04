import React from 'react';

import styles from './SpinnerContainer.module.scss';

import Spinner from '@/dls/Spinner/Spinner';

type Props = {
  children: React.ReactNode;
  isLoading: boolean;
};

const SpinnerContainer: React.FC<Props> = ({ children, isLoading }) => {
  return (
    <div className={styles.internalContainer}>
      {children}
      {isLoading && <Spinner className={styles.spinner} />}
    </div>
  );
};

export default SpinnerContainer;

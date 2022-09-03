import React from 'react';

import styles from './Title.module.scss';

import SpinnerContainer from '@/dls/Spinner/SpinnerContainer';

const Title = ({ children, isLoading = false }) => {
  return (
    <div className={styles.title}>
      <SpinnerContainer isLoading={isLoading}>{children}</SpinnerContainer>
    </div>
  );
};

export default Title;

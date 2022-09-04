import React from 'react';

import styles from './GateLoader.module.scss';

import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';

const GateLoader = () => {
  return (
    <span className={styles.container}>
      <Spinner size={SpinnerSize.Large} />
    </span>
  );
};

export default GateLoader;

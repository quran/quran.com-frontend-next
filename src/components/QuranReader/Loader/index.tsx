import React from 'react';

import Spinner, { SpinnerSize } from '../../dls/Spinner/Spinner';

import styles from './Loader.module.scss';

const Loader: React.FC = () => (
  <div className={styles.loadMoreContainer}>
    <Spinner size={SpinnerSize.Large} />
  </div>
);

export default Loader;

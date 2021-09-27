import React from 'react';

import Spinner, { SpinnerSize } from '../../dls/Spinner/Spinner';

import styles from './Loader.module.scss';

interface Props {
  isValidating: boolean;
  loadMore: () => void;
}

const Loader: React.FC<Props> = ({ isValidating, loadMore }) => {
  return (
    <div className={styles.loadMoreContainer} key={0}>
      {isValidating ? (
        <Spinner size={SpinnerSize.Large} />
      ) : (
        <button type="button" onClick={loadMore} disabled={isValidating}>
          Load More...
        </button>
      )}
    </div>
  );
};

export default Loader;

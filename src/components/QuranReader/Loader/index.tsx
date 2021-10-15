import React from 'react';

import Spinner, { SpinnerSize } from '../../dls/Spinner/Spinner';

import styles from './Loader.module.scss';

import Button from 'src/components/dls/Button/Button';

interface Props {
  isValidating: boolean;
  loadMore: () => void;
}

const Loader: React.FC<Props> = ({ isValidating, loadMore }) => {
  return (
    <div className={styles.loadMoreContainer}>
      {isValidating ? (
        <Spinner size={SpinnerSize.Large} />
      ) : (
        <Button onClick={loadMore} disabled={isValidating}>
          Load More
        </Button>
      )}
    </div>
  );
};

export default Loader;

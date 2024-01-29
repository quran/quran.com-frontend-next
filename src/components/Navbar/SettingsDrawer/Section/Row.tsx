import React from 'react';

import styles from './Row.module.scss';

interface RowProps {
  id?: string;
  children?: React.ReactNode;
}

const Row = (props: RowProps) => <div className={styles.row} {...props} />;

export default Row;

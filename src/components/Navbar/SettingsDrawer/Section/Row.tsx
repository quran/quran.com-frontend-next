import React from 'react';

import styles from './Row.module.scss';

interface RowProps {
  id?: string;
  children?: React.ReactNode;
  className?: string;
}

const Row = ({ className, ...props }: RowProps) => (
  <div className={`${styles.row} ${className || ''}`} {...props} />
);

export default Row;

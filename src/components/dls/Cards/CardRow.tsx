import React, { ReactElement } from 'react';
import styles from './CardRow.module.scss';

type CardRowProps = {
  children: ReactElement[];
};

const CardRow = ({ children, ...props }: CardRowProps) => (
  <div {...props} className={styles.container}>
    {children}
  </div>
);

export default CardRow;

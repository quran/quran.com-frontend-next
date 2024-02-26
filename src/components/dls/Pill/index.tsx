import React from 'react';

import styles from './Pill.module.scss';

type Props = {
  children: React.ReactNode;
};

const Pill: React.FC<Props> = ({ children }) => {
  return <div className={styles.container}>{children}</div>;
};

export default Pill;

import React from 'react';

import styles from './ContentContainer.module.scss';

type Props = {
  children: React.ReactNode;
};

const ContentContainer: React.FC<Props> = ({ children }) => {
  return <div className={styles.container}>{children}</div>;
};

export default ContentContainer;

import React from 'react';

import styles from './DetailSection.module.scss';

type Props = {
  title: string;
  description: React.ReactNode;
};

const DetailSection: React.FC<Props> = ({ title, description }) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.description}>{description}</div>
    </div>
  );
};

export default DetailSection;

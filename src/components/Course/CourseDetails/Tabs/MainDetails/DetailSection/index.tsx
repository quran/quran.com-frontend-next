import React from 'react';

import styles from './DetailSection.module.scss';

type Props = {
  title: string;
  description: React.ReactNode;
};

const DetailSection: React.FC<Props> = ({ title, description }) => {
  return (
    <div className={styles.container}>
      <div className={styles.title}>{`${title}: `} </div>
      <span className={styles.description}>{description}</span>
    </div>
  );
};

export default DetailSection;

import React from 'react';

import styles from './Section.module.scss';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  dataTestId?: string;
}

const Section: React.FC<SectionProps> = ({ title, children, dataTestId }) => {
  return (
    <div className={styles.section} data-testid={dataTestId}>
      <h2 className={styles.title}>{title}</h2>
      {children}
    </div>
  );
};

export default Section;

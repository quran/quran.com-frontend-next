import React from 'react';

import Trans from 'next-translate/Trans';

import styles from './Slide.module.scss';

type Props = {
  action: React.ReactNode;
  header?: React.ReactNode;
  titleKey?: string;
  description?: React.ReactNode;
};

const Slide: React.FC<Props> = ({ action, titleKey, description, header }) => {
  return (
    <div className={styles.slideContainer}>
      {header && <div className={styles.headerContainer}>{header}</div>}
      {titleKey && (
        <h2 className={styles.title}>
          <Trans components={{ br: <br /> }} i18nKey={titleKey} />
        </h2>
      )}
      <div className={styles.description}>
        <p>{description}</p>
      </div>
      <div className={styles.actionContainer}>{action}</div>
    </div>
  );
};

export default Slide;

import React from 'react';

import classNames from 'classnames';

import styles from '../styles/ContextMenu.module.scss';

interface PageInfoProps {
  juzNumber: string;
  hizbNumber: string;
  pageNumber: string;
  t: (key: string) => string;
}

/**
 * Component for displaying Quran page information (juz, hizb, page numbers)
 * @returns {JSX.Element} A React component that displays page information including juz, hizb, and page numbers
 */
const PageInfo: React.FC<PageInfoProps> = ({ juzNumber, hizbNumber, pageNumber, t }) => {
  return (
    <p className={classNames(styles.alignEnd)}>
      <span className={styles.secondaryInfo}>
        {t('juz')} {juzNumber} / {t('hizb')} {hizbNumber} -{' '}
      </span>
      <span className={styles.primaryInfo}>
        {t('page')} {pageNumber}
      </span>
    </p>
  );
};

export default PageInfo;

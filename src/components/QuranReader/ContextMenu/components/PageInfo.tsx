import React from 'react';

import classNames from 'classnames';

import styles from '../styles/ContextMenu.module.scss';

import PageBookmarkAction from './PageBookmarkAction';

interface PageInfoProps {
  juzNumber: string;
  hizbNumber: string;
  pageNumber: string;
  t: (key: string) => string;
  containerClassName?: string;
}

/**
 * Component for displaying Quran page information (juz, hizb, page numbers)
 * @returns {JSX.Element} A React component that displays page information including juz, hizb, and page numbers
 */
const PageInfo: React.FC<PageInfoProps> = ({
  juzNumber,
  hizbNumber,
  pageNumber,
  t,
  containerClassName,
}) => {
  return (
    <div className={classNames(styles.pageInfoContainer, containerClassName)}>
      <div className={styles.primaryInfo}>
        <PageBookmarkAction pageNumber={Number(pageNumber)} />
        <span>
          {t('page')} {pageNumber}
        </span>
      </div>

      <p className={styles.secondaryInfo}>
        {t('juz')} {juzNumber} / {t('hizb')} {hizbNumber}
      </p>
    </div>
  );
};

export default PageInfo;

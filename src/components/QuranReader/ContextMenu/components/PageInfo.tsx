import React, { useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from '../styles/ContextMenu.module.scss';

import PageBookmarkAction from './PageBookmarkAction';

import { toLocalizedNumber } from '@/utils/locale';

interface PageInfoProps {
  juzNumber: string;
  hizbNumber: string;
  pageNumber: string | number;
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
  const { lang } = useTranslation();

  const localizedPageNumber = toLocalizedNumber(Number(pageNumber), lang);

  // Memoize the bookmark component to prevent unnecessary re-renders
  const bookmarkComponent = useMemo(() => {
    return <PageBookmarkAction pageNumber={Number(pageNumber || 1)} />;
  }, [pageNumber]);

  return (
    <div className={classNames(styles.pageInfoContainer, containerClassName)}>
      <div className={styles.primaryInfo}>
        {bookmarkComponent}
        <span>
          {t('page')} {localizedPageNumber}
        </span>
      </div>

      <p className={styles.secondaryInfo}>
        {t('juz')} {juzNumber} / {t('hizb')} {hizbNumber}
      </p>
    </div>
  );
};

export default PageInfo;

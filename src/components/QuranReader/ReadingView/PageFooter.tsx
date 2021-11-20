import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';

import styles from './PageFooter.module.scss';

import { getPageNavigationUrl } from 'src/utils/navigation';

interface Props {
  page: number;
}

const PageFooter: React.FC<Props> = ({ page }) => {
  const { t } = useTranslation('common');
  const pageUrl = getPageNavigationUrl(page);
  return (
    <div className={styles.pageText}>
      <Link href={pageUrl} passHref>
        <p className={styles.pageLink}>{`${t('page')} ${page}`}</p>
      </Link>
    </div>
  );
};

export default PageFooter;

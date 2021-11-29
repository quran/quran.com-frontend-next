import React, { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';

import styles from './PageFooter.module.scss';

import { toLocalizedNumber } from 'src/utils/locale';
import { getPageNavigationUrl } from 'src/utils/navigation';

interface Props {
  page: number;
}

const PageFooter: React.FC<Props> = ({ page }) => {
  const { lang } = useTranslation('quran-reader');
  const pageUrl = getPageNavigationUrl(page);
  const localizedPage = useMemo(() => toLocalizedNumber(page, lang), [page, lang]);

  return (
    <div className={styles.pageText}>
      <Link href={pageUrl} passHref>
        <p className={styles.pageLink}>{localizedPage}</p>
      </Link>
    </div>
  );
};

export default PageFooter;

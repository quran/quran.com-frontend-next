import React from 'react';

import { useRouter } from 'next/router';

import styles from './PageFooter.module.scss';

import Link from '@/dls/Link/Link';
import { toLocalizedNumber } from '@/utils/locale';
import { getPageNavigationUrl } from '@/utils/navigation';

interface Props {
  page: number;
}

const PageFooter: React.FC<Props> = ({ page }) => {
  const { locale } = useRouter();
  const pageUrl = getPageNavigationUrl(page);

  return (
    <div className={styles.pageText}>
      <Link href={pageUrl} shouldPassHref shouldPrefetch={false}>
        <p className={styles.pageLink}>{toLocalizedNumber(page, locale)}</p>
      </Link>
    </div>
  );
};

export default PageFooter;

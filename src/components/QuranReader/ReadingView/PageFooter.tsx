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
      <Link href={pageUrl} shouldPrefetch={false} className={styles.pageLink}>
        {toLocalizedNumber(page, locale)}
      </Link>
    </div>
  );
};

export default PageFooter;

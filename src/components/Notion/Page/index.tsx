import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import BackIcon from '../../../../public/icons/west.svg';
import Blocks, { getPageTitle } from '../Blocks';

import styles from './Page.module.scss';

import Link, { LinkVariant } from 'src/components/dls/Link/Link';

interface Props {
  page: any;
  blocks: any[];
  isPageLayout?: boolean;
}

const Page: React.FC<Props> = ({ page, blocks, isPageLayout = false }) => {
  const { t } = useTranslation('error');
  const date = new Date(page.properties.Date.date.start).toLocaleString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  });
  const pageTitle = <p className={classNames(styles.title, styles.bold)}>{getPageTitle(page)}</p>;
  return (
    <div key={page.id} className={styles.pageContainer}>
      <div className={styles.headerSection}>
        {isPageLayout && (
          <Link href="/product-updates" variant={LinkVariant.Secondary}>
            <span className={styles.backLink}>
              <BackIcon />
              {t('go-back')}
            </span>
          </Link>
        )}
        <p className={styles.date}>{date}</p>
      </div>
      <div className={styles.blocksContainer}>
        {isPageLayout ? pageTitle : <Link href={`/product-updates/${page.id}`}>{pageTitle}</Link>}
        <Blocks blocks={blocks} />
      </div>
    </div>
  );
};

export default Page;

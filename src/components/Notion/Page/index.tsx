import React from 'react';

import classNames from 'classnames';

import Blocks, { getPageTitle } from '../Blocks';

import styles from './Page.module.scss';

import Link from 'src/components/dls/Link/Link';

interface Props {
  page: any;
  blocks: any[];
  isPageLayout?: boolean;
}

const Page: React.FC<Props> = ({ page, blocks, isPageLayout = false }) => {
  const date = new Date(page.properties.Date.date.start).toLocaleString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  });
  const pageTitle = <p className={classNames(styles.title, styles.bold)}>{getPageTitle(page)}</p>;
  return (
    <div key={page.id} className={styles.pageContainer}>
      <div className={styles.headerSection}>
        <p className={styles.date}>{date}</p>
        {isPageLayout ? pageTitle : <Link href={`/product-updates/${page.id}`}>{pageTitle}</Link>}
      </div>
      <div className={styles.blockContainer}>
        <Blocks blocks={blocks} />
      </div>
    </div>
  );
};

export default Page;

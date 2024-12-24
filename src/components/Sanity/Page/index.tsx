import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import PageBlocks from '../Blocks';

import styles from './Page.module.scss';

import Link, { LinkVariant } from '@/dls/Link/Link';
import BackIcon from '@/icons/west.svg';
import { getImageUrl } from '@/lib/sanity';
import { getProductUpdatesUrl } from '@/utils/navigation';

interface Props {
  page: any;
  isIndividualPage?: boolean;
}

const Page: React.FC<Props> = ({ page, isIndividualPage = false }) => {
  const { t } = useTranslation('error');

  const date = new Date(page.date).toLocaleString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  });
  const pageTitle = <p className={classNames(styles.title, styles.bold)}>{page.title}</p>;
  return (
    <div key={page.id} className={styles.pageContainer}>
      <div className={styles.headerSection}>
        {isIndividualPage && (
          <Link href="/product-updates" variant={LinkVariant.Secondary} shouldPrefetch={false}>
            <span className={styles.backLink}>
              <BackIcon />
              {t('go-back')}
            </span>
          </Link>
        )}
        <p className={styles.date}>{date}</p>
      </div>
      <div className={styles.blocksContainer}>
        {isIndividualPage ? (
          <>
            {pageTitle}
            <PageBlocks page={page} />
          </>
        ) : (
          <>
            <Link
              variant={LinkVariant.Blend}
              href={getProductUpdatesUrl(page.slug.current)}
              shouldPrefetch={false}
            >
              {pageTitle}
            </Link>
            {page.summary}
            {page.mainPhoto && (
              <div className={styles.imageContainer}>
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img className={styles.image} src={getImageUrl(page.mainPhoto)} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Page;

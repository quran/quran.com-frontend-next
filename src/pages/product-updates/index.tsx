import React from 'react';

import { GetServerSideProps, NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';

import styles from './changelog.module.scss';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import LocalizationMessage from '@/components/Sanity/LocalizationMessage';
import Page from '@/components/Sanity/Page';
import { PRODUCT_UPDATES_QUERY, getProductUpdatesPage } from '@/components/Sanity/utils';
import { logErrorToSentry } from '@/lib/sentry';
import { getCanonicalUrl, getProductUpdatesUrl } from '@/utils/navigation';
import withSsrRedux from '@/utils/withSsrRedux';

interface Props {
  pages?: any[];
  chaptersData?: any;
}

const ProductUpdatesPage: NextPage<Props> = ({ pages }) => {
  const { t, lang } = useTranslation('common');
  // TODO: add getLanguageAlternates when we internationalize this page
  return (
    <>
      <NextSeoWrapper
        title={t('product-updates')}
        url={getCanonicalUrl(lang, getProductUpdatesUrl())}
      />
      <PageContainer>
        <div className={styles.container}>
          <LocalizationMessage />
          {pages.map((page) => (
            <Page key={page.slug.current} page={page} />
          ))}
        </div>
      </PageContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = withSsrRedux('/product-updates', async () => {
  try {
    const pages = await getProductUpdatesPage();
    return {
      props: {
        pages,
      },
    };
  } catch (error) {
    logErrorToSentry(error, {
      transactionName: 'getServerSideProps-ProductUpdatesPage',
      metadata: {
        query: PRODUCT_UPDATES_QUERY,
      },
    });

    return {
      notFound: true,
    };
  }
});

export default ProductUpdatesPage;

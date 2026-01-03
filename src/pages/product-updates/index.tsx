import React from 'react';

import { GetStaticProps, NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';

import styles from './changelog.module.scss';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import LocalizationMessage from '@/components/Sanity/LocalizationMessage';
import Page from '@/components/Sanity/Page';
import { executeGroqQuery } from '@/lib/sanity';
import { logErrorToSentry } from '@/lib/sentry';
import { getAllChaptersData } from '@/utils/chapter';
import { getCanonicalUrl, getProductUpdatesUrl } from '@/utils/navigation';
import { REVALIDATION_PERIOD_ON_ERROR_SECONDS } from '@/utils/staticPageGeneration';

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

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    const pages = await executeGroqQuery(
      '*[_type == "productUpdate"]| order(date desc){ title, slug, mainPhoto, date, summary }',
    );
    const chaptersData = await getAllChaptersData(locale);
    return {
      props: {
        pages,
        chaptersData,
      },
      revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS,
    };
  } catch (error) {
    logErrorToSentry(error, {
      transactionName: 'getStaticProps-ProductUpdatesPage',
      metadata: {
        query:
          '*[_type == "productUpdate"]| order(date desc){ title, slug, mainPhoto, date, summary }',
      },
    });

    return {
      notFound: true,
      revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS,
    };
  }
};

export default ProductUpdatesPage;

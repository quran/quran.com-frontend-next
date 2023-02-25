import React from 'react';

import { GetStaticProps, NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';

import styles from './changelog.module.scss';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import LocalizationMessage from '@/components/Sanity/LocalizationMessage';
import Page from '@/components/Sanity/Page';
import { executeGroqQuery } from '@/lib/sanity';
import { getCanonicalUrl, getProductUpdatesUrl } from '@/utils/navigation';
import { REVALIDATION_PERIOD_ON_ERROR_SECONDS } from '@/utils/staticPageGeneration';
import Error from 'src/pages/_error';

interface Props {
  hasError?: boolean;
  pages?: any[];
}

const ProductUpdatesPage: NextPage<Props> = ({ pages, hasError }) => {
  const { t, lang } = useTranslation('common');
  if (hasError) {
    return <Error statusCode={500} />;
  }
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

export const getStaticProps: GetStaticProps = async () => {
  try {
    const pages = await executeGroqQuery(
      '*[_type == "productUpdate"]| order(date desc){ title, slug, mainPhoto, date, summary }',
    );
    return {
      props: {
        pages,
      },
      revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS,
    };
  } catch (error) {
    return {
      props: {
        hasError: true,
      },
      revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS, // 35 seconds will be enough time before we re-try generating the page again.
    };
  }
};

export default ProductUpdatesPage;

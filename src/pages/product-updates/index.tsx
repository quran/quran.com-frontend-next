import React from 'react';

import { GetStaticProps, NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';

import styles from './changelog.module.scss';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import LocalizationMessage from '@/components/Notion/LocalizationMessage';
import Page from '@/components/Notion/Page';
import PageContainer from '@/components/PageContainer';
import ChaptersData from '@/types/ChaptersData';
import { getAllChaptersData } from '@/utils/chapter';
import { getCanonicalUrl, getProductUpdatesUrl } from '@/utils/navigation';
import { getRevalidationTime } from '@/utils/notion';
import { REVALIDATION_PERIOD_ON_ERROR_SECONDS } from '@/utils/staticPageGeneration';
import { retrieveBlockChildren, retrieveDatabase } from 'src/lib/notion';
import Error from 'src/pages/_error';

type ProductUpdatesProps = {
  hasError?: boolean;
  pages?: any[];
  pagesBlocks?: any[];
  chaptersData: ChaptersData;
};

const ProductUpdates: NextPage<ProductUpdatesProps> = ({
  pages,
  pagesBlocks,
  hasError,
}): JSX.Element => {
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
          {pages.map((page, index) => (
            <Page key={page.id} page={page} blocks={pagesBlocks[index]} />
          ))}
        </div>
      </PageContainer>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    // 1. get the list of pages by querying the database.
    const pages = await retrieveDatabase(process.env.NOTION_DATABASE_ID);
    const promises = [];
    // 2. we need to get the blocks of each page (which is considered a block itself)
    pages.forEach((page) => {
      promises.push(retrieveBlockChildren(page.id));
    });
    // 3. wait for all the requests.
    const pagesBlocks = await Promise.all(promises);

    const allChaptersData = await getAllChaptersData(locale);

    return {
      props: {
        pages,
        pagesBlocks,
        chaptersData: allChaptersData,
      },
      revalidate: getRevalidationTime(pagesBlocks),
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

export default ProductUpdates;

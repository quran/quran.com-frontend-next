import React from 'react';

import { GetStaticProps, NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';

import styles from './changelog.module.scss';

import NextSeoWrapper from 'src/components/NextSeoWrapper';
import LocalizationMessage from 'src/components/Notion/LocalizationMessage';
import Page from 'src/components/Notion/Page';
import { retrieveBlockChildren, retrieveDatabase } from 'src/lib/notion';
import Error from 'src/pages/_error';
import {
  ONE_DAY_REVALIDATION_PERIOD_SECONDS,
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
} from 'src/utils/staticPageGeneration';

interface Props {
  hasError?: boolean;
  pages?: any[];
  pagesBlocks?: any[];
}

const Changelog: NextPage<Props> = ({ pages, pagesBlocks, hasError }) => {
  const { t } = useTranslation('common');
  if (hasError) {
    return <Error statusCode={500} />;
  }

  return (
    <>
      <NextSeoWrapper title={t('product-updates')} />
      <div className={styles.container}>
        <LocalizationMessage />
        {pages.map((page, index) => (
          <Page key={page.id} page={page} blocks={pagesBlocks[index]} />
        ))}
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
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
    return {
      props: {
        pages,
        pagesBlocks,
      },
      revalidate: ONE_DAY_REVALIDATION_PERIOD_SECONDS,
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

export default Changelog;

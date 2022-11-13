import { NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';

import styles from './changelog.module.scss';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import LocalizationMessage from '@/components/Notion/LocalizationMessage';
import NotionPage from '@/components/Notion/Page';
import PageContainer from '@/components/PageContainer';
import Spinner from '@/dls/Spinner/Spinner';
import ChaptersData from '@/types/ChaptersData';
import { getAllChaptersData } from '@/utils/chapter';
import { getCanonicalUrl, getProductUpdatesUrl } from '@/utils/navigation';
import { getPageTitle, getRevalidationTime } from '@/utils/notion';
import { REVALIDATION_PERIOD_ON_ERROR_SECONDS } from '@/utils/staticPageGeneration';
import { retrieveBlockChildren, retrieveDatabase, retrievePage } from 'src/lib/notion';
import Error from 'src/pages/_error';

type ProductUpdatesItemProps = {
  hasError?: boolean;
  page?: any[];
  blocks?: any[];
  chaptersData: ChaptersData;
};

const ProductUpdatesItem: NextPage<ProductUpdatesItemProps> = ({
  hasError,
  page,
  blocks,
}): JSX.Element => {
  const { lang } = useTranslation();
  const router = useRouter();
  if (router.isFallback) {
    return (
      <div className={styles.container}>
        <Spinner />
      </div>
    );
  }
  if (hasError) {
    return <Error statusCode={500} />;
  }
  const pageTitle = getPageTitle(page);
  // @ts-ignore
  const { id } = page;
  return (
    <>
      <NextSeoWrapper title={pageTitle} url={getCanonicalUrl(lang, getProductUpdatesUrl(id))} />
      <PageContainer>
        <div className={styles.container}>
          <div className={styles.backIconContainer} />
          <LocalizationMessage />
          <NotionPage page={page} blocks={blocks} isPageLayout />
        </div>
      </PageContainer>
    </>
  );
};

export const getStaticProps = async ({ params, locale }) => {
  const { id } = params;
  try {
    const response = await Promise.all([
      retrievePage(id),
      retrieveBlockChildren(id),
      getAllChaptersData(locale),
    ]);
    const page = response[0];
    const blocks = response[1];
    const chaptersData = response[2];
    return {
      props: {
        page,
        blocks,
        chaptersData,
      },
      revalidate: getRevalidationTime([blocks]),
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

export const getStaticPaths = async () => {
  const pages = await retrieveDatabase(process.env.NOTION_DATABASE_ID);
  return {
    paths: pages.map((page) => ({ params: { id: page.id } })),
    fallback: true,
  };
};

export default ProductUpdatesItem;

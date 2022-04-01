import { NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';

import styles from './changelog.module.scss';

import Spinner from 'src/components/dls/Spinner/Spinner';
import NextSeoWrapper from 'src/components/NextSeoWrapper';
import LocalizationMessage from 'src/components/Notion/LocalizationMessage';
import NotionPage from 'src/components/Notion/Page';
import PageContainer from 'src/components/PageContainer';
import { retrieveBlockChildren, retrieveDatabase, retrievePage } from 'src/lib/notion';
import Error from 'src/pages/_error';
import { getCanonicalUrl, getProductUpdatesUrl } from 'src/utils/navigation';
import { getPageTitle, getRevalidationTime } from 'src/utils/notion';
import { REVALIDATION_PERIOD_ON_ERROR_SECONDS } from 'src/utils/staticPageGeneration';

interface Props {
  hasError?: boolean;
  page?: any[];
  blocks?: any[];
}

const Page: NextPage<Props> = ({ hasError, page, blocks }) => {
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

export const getStaticProps = async (context) => {
  const { id } = context.params;
  try {
    const response = await Promise.all([retrievePage(id), retrieveBlockChildren(id)]);
    const blocks = response[1];
    return {
      props: {
        page: response[0],
        blocks,
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

export default Page;

import { NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';

import BackIcon from '../../../public/icons/west.svg';

import styles from './changelog.module.scss';

import Button, { ButtonSize, ButtonVariant } from 'src/components/dls/Button/Button';
import Spinner from 'src/components/dls/Spinner/Spinner';
import NextSeoWrapper from 'src/components/NextSeoWrapper';
import { getPageTitle } from 'src/components/Notion/Blocks';
import LocalizationMessage from 'src/components/Notion/LocalizationMessage';
import NotionPage from 'src/components/Notion/Page';
import { retrieveBlockChildren, retrieveDatabase, retrievePage } from 'src/lib/notion';
import Error from 'src/pages/_error';
import {
  ONE_DAY_REVALIDATION_PERIOD_SECONDS,
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
} from 'src/utils/staticPageGeneration';

interface Props {
  hasError?: boolean;
  page?: any[];
  blocks?: any[];
}

const Page: NextPage<Props> = ({ hasError, page, blocks }) => {
  const { t } = useTranslation('error');
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
  return (
    <>
      <NextSeoWrapper title={pageTitle} />
      <div className={styles.container}>
        <div className={styles.backIconContainer}>
          <Button
            variant={ButtonVariant.Ghost}
            href="/product-updates"
            className={styles.backIcon}
            prefix={<BackIcon />}
            size={ButtonSize.Small}
          >
            {t('go-back')}
          </Button>
        </div>
        <LocalizationMessage />
        <NotionPage key={page.id} page={page} blocks={blocks} isPageLayout />
      </div>
    </>
  );
};

export const getStaticProps = async (context) => {
  const { id } = context.params;
  try {
    const response = await Promise.all([retrievePage(id), retrieveBlockChildren(id)]);
    return {
      props: {
        page: response[0],
        blocks: response[1],
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

export const getStaticPaths = async () => {
  const pages = await retrieveDatabase(process.env.NOTION_DATABASE_ID);
  return {
    paths: pages.map((page) => ({ params: { id: page.id } })),
    fallback: true,
  };
};

export default Page;

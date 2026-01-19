/* eslint-disable react-func/max-lines-per-function */
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './changelog.module.scss';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import LocalizationMessage from '@/components/Sanity/LocalizationMessage';
import SanityPage from '@/components/Sanity/Page';
import Spinner from '@/dls/Spinner/Spinner';
import { executeGroqQuery } from '@/lib/sanity';
import { logErrorToSentry } from '@/lib/sentry';
import { getAllChaptersData } from '@/utils/chapter';
import { getCanonicalUrl, getProductUpdatesUrl } from '@/utils/navigation';
import withSsrRedux from '@/utils/withSsrRedux';

interface Props {
  page?: any[];
  chaptersData?: any;
}

const ProductUpdatePage: NextPage<Props> = ({ page }) => {
  const { lang } = useTranslation();
  const router = useRouter();
  if (router.isFallback) {
    return (
      <div className={styles.container}>
        <Spinner />
      </div>
    );
  }
  return (
    <>
      <NextSeoWrapper
        // @ts-ignore
        title={page.title}
        // @ts-ignore
        url={getCanonicalUrl(lang, getProductUpdatesUrl(page.slug.current))}
      />
      <PageContainer>
        <div className={styles.container}>
          <div className={styles.backIconContainer} />
          <LocalizationMessage />
          <SanityPage page={page} isIndividualPage />
        </div>
      </PageContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = withSsrRedux(
  '/product-updates/[id]',
  async (context) => {
    const { params, locale } = context;
    const { id = '' } = params;

    try {
      const page = await executeGroqQuery(
        '*[_type == "productUpdate" && slug.current == $slug][0]',
        {
          slug: id,
        },
        true,
      );
      if (!page) {
        // @ts-ignore
        throw new Error('invalid slug');
      }
      const chaptersData = await getAllChaptersData(locale);
      return {
        props: {
          page,
          chaptersData,
        },
      };
    } catch (error) {
      logErrorToSentry(error, {
        transactionName: 'getServerSideProps-ProductUpdatePage',
        metadata: {
          slug: id,
        },
      });
      return {
        notFound: true,
      };
    }
  },
);

export default ProductUpdatePage;

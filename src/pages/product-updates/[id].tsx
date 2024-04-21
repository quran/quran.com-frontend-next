import { NextPage } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './changelog.module.scss';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import LocalizationMessage from '@/components/Sanity/LocalizationMessage';
import SanityPage from '@/components/Sanity/Page';
import Spinner from '@/dls/Spinner/Spinner';
import { executeGroqQuery } from '@/lib/sanity';
import { getCanonicalUrl, getProductUpdatesUrl } from '@/utils/navigation';
import { REVALIDATION_PERIOD_ON_ERROR_SECONDS } from '@/utils/staticPageGeneration';
import Error from 'src/pages/_error';

interface Props {
  hasError?: boolean;
  page?: any[];
}

const ProductUpdatePage: NextPage<Props> = ({ hasError, page }) => {
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

export const getStaticProps = async (context) => {
  const { id = '' } = context.params;
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
    return {
      props: {
        page,
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

export const getStaticPaths = async () => {
  const pages = await executeGroqQuery('*[_type == "productUpdate"]{ slug}');
  return {
    paths: pages.map((page) => ({ params: { id: page.slug.current } })),
    fallback: true,
  };
};

export default ProductUpdatePage;

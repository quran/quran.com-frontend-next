import classNames from 'classnames';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';

import contentPageStyles from '../contentPage.module.scss';

import styles from './article.module.scss';

import { fetcher } from '@/api';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import { logErrorToSentry } from '@/lib/sentry';
import { makeUrl } from '@/utils/api';
import { getDir, getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl } from '@/utils/navigation';
import { REVALIDATION_PERIOD_ON_ERROR_SECONDS } from '@/utils/staticPageGeneration';
import { getBasePath } from '@/utils/url';

type ArticleDetail = {
  id: string;
  title?: string;
  slug?: string;
  description?: string;
  content?: string;
};

type ArticleDetailResponse = {
  data?: ArticleDetail | null;
};

type ArticleListResponse = {
  articles?: ArticleDetail[];
  data?: ArticleDetail[];
};

interface Props {
  article?: ArticleDetail | null;
}

const ARTICLE_PATH_PREFIX = '/articles';

const ArticlePage: NextPage<Props> = ({ article }) => {
  const { lang } = useTranslation('articles');
  const title = article?.title || '';
  const slug = article?.slug || '';
  const shouldRenderTitle = Boolean(title && !article?.content?.includes('<h1'));
  const canonicalPath = `${ARTICLE_PATH_PREFIX}/${slug}`;

  return (
    <>
      <NextSeoWrapper
        title={title}
        url={getCanonicalUrl(lang, canonicalPath)}
        languageAlternates={getLanguageAlternates(canonicalPath)}
        description={article?.description}
      />
      <PageContainer>
        <div
          className={classNames(contentPageStyles.contentPage, styles.article)}
          dir={getDir(lang)}
        >
          {shouldRenderTitle ? <h1>{title}</h1> : null}
          {article?.content ? (
            <div
              className={styles.articleBody}
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : null}
        </div>
      </PageContainer>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const response = await fetcher<ArticleListResponse>(makeUrl('/articles'), {
      headers: {
        origin: getBasePath(),
      },
    });
    const articles = response?.articles ?? response?.data ?? [];
    return {
      paths: articles
        .filter((article) => article.slug)
        .map((article) => ({ params: { slug: article.slug } })),
      fallback: 'blocking',
    };
  } catch (error) {
    logErrorToSentry(error, {
      transactionName: 'getStaticPaths-ArticlePage',
    });
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = String(params?.slug || '');

  if (!slug) {
    return { notFound: true };
  }

  try {
    const response = await fetcher<ArticleDetailResponse>(makeUrl(`/articles/${slug}`), {
      headers: {
        origin: getBasePath(),
      },
    });
    const article = response?.data ?? null;

    if (!article) {
      return { notFound: true, revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS };
    }

    return {
      props: {
        article,
      },
      revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS,
    };
  } catch (error) {
    logErrorToSentry(error, {
      transactionName: 'getStaticProps-ArticlePage',
      metadata: { slug },
    });
    return {
      notFound: true,
      revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS,
    };
  }
};

export default ArticlePage;

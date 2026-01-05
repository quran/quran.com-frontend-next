import { useMemo } from 'react';

import classNames from 'classnames';
import { GetStaticProps, NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';

import contentPageStyles from '../contentPage.module.scss';

import styles from './articles.module.scss';

import { fetcher } from '@/api';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import Link, { LinkVariant } from '@/dls/Link/Link';
import { logErrorToSentry } from '@/lib/sentry';
import { makeUrl } from '@/utils/auth/apiPaths';
import { getDir, getLanguageAlternates } from '@/utils/locale';
import {
  getBeyondRamadanNavigationUrl,
  getCanonicalUrl,
  getRamadanNavigationUrl,
  getTakeNotesNavigationUrl,
  getWhatIsRamadanNavigationUrl,
} from '@/utils/navigation';
import { REVALIDATION_PERIOD_ON_ERROR_SECONDS } from '@/utils/staticPageGeneration';
import { getBasePath } from '@/utils/url';

type ArticleEntry = {
  href: string;
  titleKey: string;
  descriptionKey: string;
};

type ArticleSummary = {
  slug: string;
  title?: string;
  description?: string;
};

type ArticleListResponse = {
  articles?: ArticleSummary[];
  data?: ArticleSummary[];
};

interface Props {
  articles?: ArticleSummary[];
}

const FALLBACK_ARTICLES: ArticleEntry[] = [
  {
    href: '/about-the-quran',
    titleKey: 'items.about-the-quran.title',
    descriptionKey: 'items.about-the-quran.description',
  },
  {
    href: getWhatIsRamadanNavigationUrl(),
    titleKey: 'items.what-is-ramadan.title',
    descriptionKey: 'items.what-is-ramadan.description',
  },
  {
    href: getRamadanNavigationUrl(),
    titleKey: 'items.ramadan.title',
    descriptionKey: 'items.ramadan.description',
  },
  {
    href: getBeyondRamadanNavigationUrl(),
    titleKey: 'items.beyond-ramadan.title',
    descriptionKey: 'items.beyond-ramadan.description',
  },
  {
    href: getTakeNotesNavigationUrl(),
    titleKey: 'items.take-notes.title',
    descriptionKey: 'items.take-notes.description',
  },
];

const PATH = '/articles';

const getArticleHref = (slug: string): string => {
  if (!slug) return '/';
  if (slug.startsWith('/')) return slug;
  return `/articles/${slug}`;
};

// eslint-disable-next-line react-func/max-lines-per-function
const ArticlesPage: NextPage<Props> = ({ articles }) => {
  const { t, lang } = useTranslation('articles');
  const entries = useMemo(() => {
    if (articles && articles.length > 0) {
      return articles.map((article) => ({
        href: getArticleHref(article.slug),
        title: article.title,
        description: article.description,
      }));
    }

    return FALLBACK_ARTICLES.map((article) => ({
      href: article.href,
      title: t(article.titleKey),
      description: t(article.descriptionKey),
    }));
  }, [articles, t]);

  return (
    <>
      <NextSeoWrapper
        title={t('title')}
        url={getCanonicalUrl(lang, PATH)}
        languageAlternates={getLanguageAlternates(PATH)}
        description={t('description')}
      />
      <PageContainer>
        <div
          className={classNames(contentPageStyles.contentPage, styles.container)}
          dir={getDir(lang)}
        >
          <h1>{t('title')}</h1>
          <p className={styles.description}>{t('description')}</p>
          <div className={styles.list} role="list">
            {entries.map((article) => (
              <div key={article.href} className={styles.listItem} role="listitem">
                <Link href={article.href} variant={LinkVariant.Primary} className={styles.card}>
                  <span className={styles.cardTitle}>{article.title}</span>
                  {article.description ? (
                    <span className={styles.cardDescription}>{article.description}</span>
                  ) : null}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    </>
  );
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  try {
    const response = await fetcher<ArticleListResponse>(makeUrl('articles'), {
      headers: {
        origin: getBasePath(),
      },
    });
    const apiArticles = response?.articles ?? response?.data ?? [];
    return {
      props: {
        articles: apiArticles,
      },
      revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS,
    };
  } catch (error) {
    logErrorToSentry(error, {
      transactionName: 'getStaticProps-ArticlesPage',
    });
    return {
      props: {
        articles: [],
      },
      revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS,
    };
  }
};

export default ArticlesPage;

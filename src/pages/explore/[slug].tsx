import classNames from 'classnames';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Script from 'next/script';
import useTranslation from 'next-translate/useTranslation';

import contentPageStyles from '../contentPage.module.scss';

import styles from './explore-page.module.scss';

import VerseChunkWidget from '@/components/Course/LessonHtmlContent/VerseChunkWidget';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import HtmlContent from '@/components/RichText/HtmlContent';
import Button, { ButtonVariant } from '@/dls/Button/Button';
import ArrowLeft from '@/icons/west.svg';
import { logErrorToSentry } from '@/lib/sentry';
import {
  ContentArticle,
  explorePath,
  fetchContentArticle,
  fetchContentArticles,
  getPageImage,
  normalizeExploreSlug,
} from '@/utils/explore/content-api';
import { parseContentChunks } from '@/utils/lessonContentParser';
import { getDir, getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl } from '@/utils/navigation';
import { REVALIDATION_PERIOD_ON_ERROR_SECONDS } from '@/utils/staticPageGeneration';

interface Props {
  contentArticle?: ContentArticle | null;
}

const renderArticleContent = (html: string) =>
  parseContentChunks(html).map((chunk) =>
    chunk.type === 'html' ? (
      <HtmlContent key={chunk.key} html={chunk.content} />
    ) : (
      <VerseChunkWidget
        key={chunk.key}
        reference={chunk.reference}
        fallbackHtml={chunk.originalHtml}
      />
    ),
  );

const ExploreContentPage: NextPage<Props> = ({ contentArticle }) => {
  const { lang } = useTranslation('articles');
  const { t: tCommon } = useTranslation('common');
  const title = contentArticle?.title || '';
  const pageSlug = contentArticle?.slug || '';
  const heroImage = getPageImage(contentArticle?.image || contentArticle?.thumbnail);
  const imageAlt = title || pageSlug;
  const shouldRenderTitle = Boolean(title && !contentArticle?.text?.includes('<h1'));
  const canonicalPath = pageSlug ? `${explorePath}/${pageSlug}` : explorePath;
  const hasQuranEmbed =
    contentArticle?.text?.includes('data-quran-embed="true"') ||
    contentArticle?.text?.includes('/embed/v1');

  return (
    <>
      {hasQuranEmbed ? <Script src="/widget/embed-widget.js" strategy="afterInteractive" /> : null}
      <NextSeoWrapper
        title={title}
        url={getCanonicalUrl(lang, canonicalPath)}
        languageAlternates={getLanguageAlternates(canonicalPath)}
        description={contentArticle?.description}
        image={heroImage}
      />
      <PageContainer>
        <div className={styles.backButtonWrapper} dir={getDir(lang)}>
          <Button href={explorePath} variant={ButtonVariant.Ghost} ariaLabel={tCommon('back')}>
            <ArrowLeft />
            <p className={styles.backText}>{tCommon('back')}</p>
          </Button>
        </div>
        <div className={classNames(contentPageStyles.contentPage, styles.page)} dir={getDir(lang)}>
          {shouldRenderTitle ? <h1>{title}</h1> : null}
          {heroImage ? (
            <div className={styles.hero}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={styles.heroImage} src={heroImage} alt={imageAlt} />
            </div>
          ) : null}
          {contentArticle?.text ? (
            <div className={styles.pageBody}>{renderArticleContent(contentArticle.text)}</div>
          ) : null}
        </div>
      </PageContainer>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const articles = await fetchContentArticles('en');
    const paths = articles
      .map((article) => normalizeExploreSlug(article.slug))
      .filter((articleSlug): articleSlug is string => Boolean(articleSlug))
      .map((articleSlug) => ({ params: { slug: articleSlug } }));

    return {
      paths,
      fallback: 'blocking',
    };
  } catch (error) {
    logErrorToSentry(error, {
      transactionName: 'getStaticPaths-ExplorePageSlug',
    });
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
};

export const getStaticProps: GetStaticProps<Props> = async ({ params, locale }) => {
  const slug = String(params?.slug || '');
  if (!slug) {
    return { notFound: true };
  }
  try {
    const contentArticle = await fetchContentArticle(slug, locale || 'en');
    if (!contentArticle) {
      return { notFound: true, revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS };
    }
    return {
      props: {
        contentArticle,
      },
      revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS,
    };
  } catch (error) {
    logErrorToSentry(error, {
      transactionName: 'getStaticProps-ExplorePageSlug',
      metadata: { slug },
    });
    return {
      notFound: true,
      revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS,
    };
  }
};

export default ExploreContentPage;

import classNames from 'classnames';
import { GetServerSideProps, NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';

import styles from './explore.module.scss';

import ContentContainer from '@/components/Course/ContentContainer';
import coursesListStyles from '@/components/Course/CoursesList/LessonsList.module.scss';
import coursesLayoutStyles from '@/components/Course/CoursesPageLayout/CoursesPageLayout.module.scss';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import Card, { CardSize } from '@/dls/Card/Card';
import Link from '@/dls/Link/Link';
import { logErrorToSentry } from '@/lib/sentry';
import layoutStyles from '@/pages/index.module.scss';
import {
  ContentArticle,
  explorePath,
  fetchContentArticles,
  getExploreHref,
  getPageImage,
} from '@/utils/explore/content-api';
import { getDir, getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl } from '@/utils/navigation';

interface Props {
  articles?: ContentArticle[];
}

const normalize_whitespace = (value: string) => value.replace(/\s+/g, ' ').trim();

const strip_html = (value: string) => normalize_whitespace(value.replace(/<[^>]+>/g, ' '));

const strip_markdown = (value: string) =>
  normalize_whitespace(
    value
      .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
      .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
      .replace(/`{1,3}[^`]*`{1,3}/g, ' ')
      .replace(/[*_~]/g, ' ')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\s*[-+]\s+/g, ' ')
      .replace(/\s{2,}/g, ' '),
  );

const to_plain_text = (value: string) => strip_markdown(strip_html(value));

const slug_to_title = (slug?: string) => {
  if (!slug) return '';

  return slug
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const truncate_text = (value: string, max_length: number) =>
  value.length > max_length ? `${value.slice(0, max_length).trimEnd()}...` : value;

const resolve_card_title = (article: ContentArticle) => {
  const title = normalize_whitespace(article.title || '');
  if (title) return title;
  return slug_to_title(article.slug);
};

const resolve_card_description = (article: ContentArticle) => {
  const description = to_plain_text(article.description || '');
  if (description) return description;
  return null;
};

const ExplorePage: NextPage<Props> = ({ articles }) => {
  const { t, lang } = useTranslation('articles');

  const entries = (articles || [])
    .filter((article) => article.slug)
    .map((article) => {
      const title = resolve_card_title(article);
      const raw_description = resolve_card_description(article);
      const description = raw_description ? truncate_text(raw_description, 140) : undefined;

      return {
        href: getExploreHref(article.slug),
        title,
        description,
        image: getPageImage(article.thumbnail || article.image),
      };
    });

  return (
    <>
      <NextSeoWrapper
        title={t('title')}
        url={getCanonicalUrl(lang, explorePath)}
        languageAlternates={getLanguageAlternates(explorePath)}
        description={t('description')}
      />
      <div className={layoutStyles.pageContainer}>
        <ContentContainer>
          <div dir={getDir(lang)}>
            <p className={coursesLayoutStyles.title}>{t('title')}</p>
            <div className={coursesLayoutStyles.desc}>{t('description')}</div>
            <div className={classNames(layoutStyles.flow, coursesLayoutStyles.container)}>
              <div className={styles.gridWrapper}>
                <div className={classNames(coursesListStyles.container, styles.grid)} role="list">
                  {entries.map((page) => (
                    <div key={page.href} className={styles.listItem} role="listitem">
                      <Link href={page.href} className={styles.cardLink}>
                        <Card
                          imgSrc={page.image}
                          imgAlt={page.title || ''}
                          title={<span className={styles.cardTitle}>{page.title || ''}</span>}
                          description={page.description}
                          descriptionClassName={styles.cardDescription}
                          footer={<span className={styles.readMore}>{t('read_more')}</span>}
                          size={CardSize.Large}
                          shouldShowFullTitle
                          className={classNames(
                            coursesListStyles.cardContainer,
                            styles.cardContainer,
                          )}
                        />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ContentContainer>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ locale }) => {
  const language = locale || 'en';
  try {
    const articles = await fetchContentArticles(language);
    return {
      props: {
        articles,
      },
    };
  } catch (error) {
    logErrorToSentry(error, {
      transactionName: 'getServerSideProps-ExplorePage',
      metadata: { language },
    });
    return {
      props: {
        articles: [],
      },
    };
  }
};

export default ExplorePage;

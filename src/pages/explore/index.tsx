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

const ExplorePage: NextPage<Props> = ({ articles }) => {
  const { t, lang } = useTranslation('articles');

  const entries = (articles || [])
    .filter((article) => article.slug)
    .map((article) => ({
      href: getExploreHref(article.slug),
      title: article.title,
      description: article.description,
      image: getPageImage(article.thumbnail || article.image),
    }));

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

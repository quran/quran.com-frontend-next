import { useEffect, useState } from 'react'

import classNames from 'classnames'
import { GetStaticProps, NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'

import styles from './explore.module.scss'

import { fetcher } from '@/api'
import ContentContainer from '@/components/Course/ContentContainer'
import coursesListStyles from '@/components/Course/CoursesList/LessonsList.module.scss'
import coursesLayoutStyles from '@/components/Course/CoursesPageLayout/CoursesPageLayout.module.scss'
import NextSeoWrapper from '@/components/NextSeoWrapper'
import Card, { CardSize } from '@/dls/Card/Card'
import Link from '@/dls/Link/Link'
import { logErrorToSentry } from '@/lib/sentry'
import layout_styles from '@/pages/index.module.scss'
import { getDir, getLanguageAlternates } from '@/utils/locale'
import { getCanonicalUrl } from '@/utils/navigation'
import { REVALIDATION_PERIOD_ON_ERROR_SECONDS } from '@/utils/staticPageGeneration'
import { getBasePath, getProxiedServiceUrl, QuranFoundationService } from '@/utils/url'

type ContentPageSummary = {
  id: string
  parent?: string | null
  slug?: string
  title?: string
  description?: string
  image?: string
  thumbnail?: string
}

type ContentArticleSummary = ContentPageSummary

type ContentArticlesResponse = {
  articles?: ContentArticleSummary[]
}

interface Props {
  articles?: ContentArticleSummary[]
}

const path = '/explore'
const placeholderImage = 'https://images.quran.com/coming-soon.png'

const getPageImage = (url?: string) => {
  if (!url) return placeholderImage
  if (url.startsWith('//')) return `https:${url}`
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) return url
  return placeholderImage
}

const getPageHref = (slug?: string): string => {
  if (!slug) return '/'
  const normalized = slug.replace(/^\/+/, '')
  if (!normalized || normalized.includes('/')) return '/'
  return `/explore/${normalized}`
}

const makeContentArticlesUrl = (language: string): string =>
  getProxiedServiceUrl(
    QuranFoundationService.CONTENT,
    `/api/qdc/articles?language=${encodeURIComponent(language)}`,
  )

const ExplorePage: NextPage<Props> = ({ articles }) => {
  const { t, lang } = useTranslation('articles')
  const [contentArticles, setContentArticles] = useState(articles || [])

  useEffect(() => {
    fetcher<ContentArticlesResponse>(makeContentArticlesUrl(lang), {
      headers: {
        origin: getBasePath(),
      },
    })
      .then((response) => {
        setContentArticles(response?.articles ?? [])
      })
      .catch((error) => {
        logErrorToSentry(error, {
          transactionName: 'ExplorePage-useEffect',
          metadata: { language: lang },
        })
      })
  }, [lang])

  const entries = contentArticles
    .filter((article) => article.slug)
    .map((article) => ({
      href: getPageHref(article.slug),
      title: article.title,
      description: article.description,
      image: getPageImage(article.thumbnail || article.image),
    }))

  return (
    <>
      <NextSeoWrapper
        title={t('title')}
        url={getCanonicalUrl(lang, path)}
        languageAlternates={getLanguageAlternates(path)}
        description={t('description')}
      />
      <div className={layout_styles.pageContainer}>
        <ContentContainer>
          <div dir={getDir(lang)}>
            <p className={coursesLayoutStyles.title}>{t('title')}</p>
            <div className={coursesLayoutStyles.desc}>{t('description')}</div>
            <div className={classNames(layout_styles.flow, coursesLayoutStyles.container)}>
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
                          className={classNames(coursesListStyles.cardContainer, styles.cardContainer)}
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
  )
}

export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => {
  const language = locale || 'en'
  try {
    const articlesResponse = await fetcher<ContentArticlesResponse>(
      makeContentArticlesUrl(language),
      {
        headers: {
          origin: getBasePath(),
        },
      },
    )
    const articles = articlesResponse?.articles ?? []

    return {
      props: {
        articles,
      },
      revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS,
    }
  } catch (error) {
    logErrorToSentry(error, {
      transactionName: 'getStaticProps-ExplorePage',
      metadata: { language },
    })
    return {
      props: {
        articles: [],
      },
      revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS,
    }
  }
}

export default ExplorePage

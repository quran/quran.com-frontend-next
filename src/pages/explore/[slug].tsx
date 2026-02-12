import { useEffect, useState } from 'react'

import classNames from 'classnames'
import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import { useRouter } from 'next/router'
import useTranslation from 'next-translate/useTranslation'

import contentPageStyles from '../contentPage.module.scss'

import styles from './explore-page.module.scss'

import { fetcher } from '@/api'
import NextSeoWrapper from '@/components/NextSeoWrapper'
import PageContainer from '@/components/PageContainer'
import Button, { ButtonVariant } from '@/dls/Button/Button'
import { logErrorToSentry } from '@/lib/sentry'
import ArrowLeft from '@/icons/west.svg'
import { getDir, getLanguageAlternates } from '@/utils/locale'
import { getCanonicalUrl } from '@/utils/navigation'
import { REVALIDATION_PERIOD_ON_ERROR_SECONDS } from '@/utils/staticPageGeneration'
import { getBasePath, getProxiedServiceUrl, QuranFoundationService } from '@/utils/url'

type ContentPage = {
  id: string
  title?: string
  slug?: string
  description?: string
  text?: string
  image?: string
  thumbnail?: string
  lang?: string
}

type ContentArticle = ContentPage

type ContentArticleResponse = {
  article?: ContentArticle | null
}

type ContentArticlesResponse = {
  articles?: ContentArticle[]
}

interface Props {
  contentArticle?: ContentArticle | null
}

const pagePathPrefix = '/explore'
const placeholderImage = 'https://images.quran.com/coming-soon.png'

const getPageImage = (url?: string) => {
  if (!url) return placeholderImage
  if (url.startsWith('//')) return `https:${url}`
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) return url
  return placeholderImage
}
const makeContentArticleUrl = (slug: string, language: string): string =>
  getProxiedServiceUrl(
    QuranFoundationService.CONTENT,
    `/api/qdc/articles/by_slug/${slug}?language=${encodeURIComponent(language)}`,
  )

const makeContentArticlesUrl = (language: string): string =>
  getProxiedServiceUrl(
    QuranFoundationService.CONTENT,
    `/api/qdc/articles?language=${encodeURIComponent(language)}`,
  )

const normalizeExploreSlug = (value?: string): string | null => {
  if (!value) return null
  const normalized = value.replace(/^\/+/, '')
  if (!normalized || normalized.includes('/')) return null
  return normalized
}

const ExploreContentPage: NextPage<Props> = ({ contentArticle }) => {
  const { lang } = useTranslation('articles')
  const { t: tCommon } = useTranslation('common')
  const { query } = useRouter()
  const [currentArticle, setCurrentArticle] = useState(contentArticle)
  const slugParam = Array.isArray(query.slug) ? query.slug[0] : query.slug
  const slug = typeof slugParam === 'string' ? slugParam : ''

  useEffect(() => {
    setCurrentArticle(contentArticle)
  }, [contentArticle])

  useEffect(() => {
    if (!slug) return
    fetcher<ContentArticleResponse>(makeContentArticleUrl(slug, lang), {
      headers: {
        origin: getBasePath(),
      },
    })
      .then((response) => {
        if (response?.article) {
          setCurrentArticle(response.article)
        }
      })
      .catch((error) => {
        logErrorToSentry(error, {
          transactionName: 'ExplorePageSlug-useEffect',
          metadata: { language: lang, slug },
        })
      })
  }, [lang, slug])

  const title = currentArticle?.title || ''
  const pageSlug = currentArticle?.slug || slug
  const heroImage = getPageImage(currentArticle?.image || currentArticle?.thumbnail)
  const imageAlt = title || pageSlug
  const shouldRenderTitle = Boolean(title && !currentArticle?.text?.includes('<h1'))
  const canonicalPath = `${pagePathPrefix}/${pageSlug}`

  return (
    <>
      <NextSeoWrapper
        title={title}
        url={getCanonicalUrl(lang, canonicalPath)}
        languageAlternates={getLanguageAlternates(canonicalPath)}
        description={currentArticle?.description}
        image={heroImage}
      />
      <PageContainer>
        <div className={styles.backButtonWrapper} dir={getDir(lang)}>
          <Button
            href={pagePathPrefix}
            variant={ButtonVariant.Ghost}
            ariaLabel={tCommon('back')}
          >
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
          {currentArticle?.text ? (
            <div
              className={styles.pageBody}
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: currentArticle.text }}
            />
          ) : null}
        </div>
      </PageContainer>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const articlesResponse = await fetcher<ContentArticlesResponse>(
      makeContentArticlesUrl('en'),
      {
        headers: {
          origin: getBasePath(),
        },
      },
    )
    const articles = articlesResponse?.articles ?? []
    const paths = articles
      .map((article) => normalizeExploreSlug(article.slug))
      .filter((articleSlug): articleSlug is string => Boolean(articleSlug))
      .map((articleSlug) => ({ params: { slug: articleSlug } }))

    return {
      paths,
      fallback: 'blocking',
    }
  } catch (error) {
    logErrorToSentry(error, {
      transactionName: 'getStaticPaths-ExplorePageSlug',
    })
    return {
      paths: [],
      fallback: 'blocking',
    }
  }
}

export const getStaticProps: GetStaticProps<Props> = async ({ params, locale }) => {
  const slug = String(params?.slug || '')

  if (!slug) {
    return { notFound: true }
  }

  try {
    const response = await fetcher<ContentArticleResponse>(
      makeContentArticleUrl(slug, locale || 'en'),
      {
        headers: {
          origin: getBasePath(),
        },
      },
    )
    const contentArticle = response?.article ?? null

    if (!contentArticle) {
      return { notFound: true, revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS }
    }

    return {
      props: {
        contentArticle,
      },
      revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS,
    }
  } catch (error) {
    logErrorToSentry(error, {
      transactionName: 'getStaticProps-ExplorePageSlug',
      metadata: { slug },
    })
    return {
      notFound: true,
      revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS,
    }
  }
}

export default ExploreContentPage

import { fetcher } from '@/api';
import { getBasePath, getProxiedServiceUrl, QuranFoundationService } from '@/utils/url';

type ContentArticleResponse = {
  article?: ContentArticle | null;
};

type ContentArticlesResponse = {
  articles?: ContentArticle[];
};

export type ContentArticle = {
  id: string;
  parent?: string | null;
  slug?: string;
  title?: string;
  description?: string;
  text?: string;
  image?: string;
  thumbnail?: string;
  lang?: string;
};

export const explorePath = '/explore';

const placeholderImage = 'https://images.quran.com/coming-soon.png';

const makeContentArticleUrl = (slug: string, language: string): string =>
  getProxiedServiceUrl(
    QuranFoundationService.CONTENT,
    `/api/qdc/articles/by_slug/${slug}?language=${encodeURIComponent(language)}`,
  );

const makeContentArticlesUrl = (language: string): string =>
  getProxiedServiceUrl(
    QuranFoundationService.CONTENT,
    `/api/qdc/articles?language=${encodeURIComponent(language)}`,
  );

export const getPageImage = (url?: string): string => {
  if (!url) return placeholderImage;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) return url;
  return placeholderImage;
};

export const getExploreHref = (slug?: string): string => {
  if (!slug) return '/';
  const normalized = slug.replace(/^\/+/, '');
  if (!normalized || normalized.includes('/')) return '/';
  return `${explorePath}/${normalized}`;
};

export const normalizeExploreSlug = (value?: string): string | null => {
  if (!value) return null;
  const normalized = value.replace(/^\/+/, '');
  if (!normalized || normalized.includes('/')) return null;
  return normalized;
};

export const fetchContentArticles = async (language: string): Promise<ContentArticle[]> => {
  const response = await fetcher<ContentArticlesResponse>(makeContentArticlesUrl(language), {
    headers: {
      origin: getBasePath(),
    },
  });
  return response?.articles ?? [];
};

export const fetchContentArticle = async (
  slug: string,
  language: string,
): Promise<ContentArticle | null> => {
  const response = await fetcher<ContentArticleResponse>(makeContentArticleUrl(slug, language), {
    headers: {
      origin: getBasePath(),
    },
  });
  return response?.article ?? null;
};

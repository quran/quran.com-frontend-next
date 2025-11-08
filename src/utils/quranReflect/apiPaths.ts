/* eslint-disable @typescript-eslint/naming-convention */

import { fetcher } from '@/api';
import { localeToQuranReflectLanguageID } from '@/utils/locale';
import stringify from '@/utils/qs-stringify';
import AyahReflectionsRequestParams from 'types/QuranReflect/AyahReflectionsRequestParams';
import AyahReflectionsResponse from 'types/QuranReflect/AyahReflectionsResponse';
import Tab from 'types/QuranReflect/Tab';

export const REFLECTION_POST_TYPE_ID = '1';
export const LESSON_POST_TYPE_ID = '2';

const ensureAbsoluteUrl = (url: string): string => {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const isLocalhost =
    url.startsWith('localhost') || url.startsWith('127.') || url.startsWith('::1');
  return `${isLocalhost ? 'http' : 'https'}://${url}`;
};

/**
 * Resolves the base URL to use for API requests to Quran Reflect, going through the proxy.
 * The resolution order is as follows:
 * 1. If NEXT_PUBLIC_QURAN_REFLECT_API_BASE_URL is set, use that.
 * 2. If APP_BASE_URL, NEXT_PUBLIC_APP_BASE_URL, SITE_URL, or NEXT_PUBLIC_SITE_URL is set, use that.
 * 3. If VERCEL_URL or NEXT_PUBLIC_VERCEL_URL is set, use that.
 * 4. Otherwise, default to localhost with the appropriate port.
 * @returns {string} The resolved base URL.
 */
const resolveAppBaseUrl = (): string => {
  const explicitBase =
    process.env.NEXT_PUBLIC_APP_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.APP_BASE_URL;
  if (explicitBase) return ensureAbsoluteUrl(explicitBase).replace(/\/$/, '');

  const vercelBase = process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL;
  if (vercelBase) return ensureAbsoluteUrl(vercelBase).replace(/\/$/, '');

  const port = process.env.PORT || 3000;
  return `http://localhost:${port}`.replace(/\/$/, '');
};

const getProxyBaseUrl = (): string => {
  const override = process.env.NEXT_PUBLIC_QURAN_REFLECT_API_BASE_URL;
  if (override) return ensureAbsoluteUrl(override).replace(/\/$/, '');
  return `${resolveAppBaseUrl()}/api/proxy/quran-reflect`;
};

export const API_HOST = getProxyBaseUrl();

export const makeQuranReflectApiUrl = (path: string, parameters = {}): string => {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  const params = stringify(parameters);
  return `${API_HOST}/${normalizedPath}${params ? `?${params}` : ''}`;
};

/* eslint-disable import/prefer-default-export */
export const makeAyahReflectionsUrl = ({
  surahId,
  ayahNumber,
  locale,
  page = 1,
  tab = Tab.Popular,
  postTypeIds = [],
  reflectionLanguages = [],
}: AyahReflectionsRequestParams) => {
  const normalizedLocale = locale?.split('-')[0]?.toLowerCase() || 'en';
  const isoCodes =
    reflectionLanguages.length > 0
      ? reflectionLanguages.map((code) => code?.split('-')[0]?.toLowerCase())
      : [normalizedLocale];
  const languageIds = Array.from(
    new Set(
      isoCodes
        .map((code) => localeToQuranReflectLanguageID(code))
        .filter((id): id is number => typeof id === 'number'),
    ),
  );

  return makeQuranReflectApiUrl('posts/feed', {
    'filter[references][0][chapterId]': surahId,
    'filter[references][0][from]': ayahNumber,
    'filter[references][0][to]': ayahNumber,
    ...(postTypeIds.length > 0 && { 'filter[postTypeIds]': postTypeIds.join(',') }),
    page,
    tab,
    languages: languageIds.join(','),
    'filter[verifiedOnly]': true,
  });
};

const makeReflectionViewsUrl = (postId: string) => {
  return makeQuranReflectApiUrl(`v1/posts/${postId}/views`);
};

export const postReflectionViews = async (postId: string): Promise<AyahReflectionsResponse> =>
  fetcher(makeReflectionViewsUrl(postId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

export const getAyahReflections = async (
  ayahReflectionsUrl: string,
): Promise<AyahReflectionsResponse> => fetcher(ayahReflectionsUrl);

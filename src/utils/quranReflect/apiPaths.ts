/* eslint-disable @typescript-eslint/naming-convention */

import { localeToQuranReflectLanguageID } from './locale';

import { fetcher } from '@/api';
import AyahReflectionsRequestParams from '@/types/QuranReflect/AyahReflectionsRequestParams';
import AyahReflectionsResponse from '@/types/QuranReflect/AyahReflectionsResponse';
import Tab from '@/types/QuranReflect/Tab';
import stringify from '@/utils/qs-stringify';

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
 * Resolves the app's base URL from environment variables.
 * Checks NEXT_PUBLIC_APP_BASE_URL, NEXT_PUBLIC_SITE_URL, APP_BASE_URL,
 * then Vercel URLs, finally defaulting to localhost with PORT.
 * @returns {string} The resolved app base URL without trailing slash.
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

/**
 * Resolves the base URL for Quran Reflect API requests through the proxy.
 * Uses NEXT_PUBLIC_QURAN_REFLECT_API_BASE_URL if set,
 * otherwise constructs the proxy URL using the app base URL.
 * @returns {string} The resolved base URL.
 */
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

export const makeGetUserReflectionsUrl = ({
  page = 1,
  limit = 10,
}: {
  page: number;
  limit?: number;
}) => makeQuranReflectApiUrl(`posts/my-posts`, { page, limit });

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
    new Set(isoCodes.map((code) => localeToQuranReflectLanguageID(code))),
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
  return makeQuranReflectApiUrl(`posts/viewed/${postId}`);
};

export const logPostView = async (postId: string): Promise<{ success: boolean }> =>
  fetcher(makeReflectionViewsUrl(postId));

export const getAyahReflections = async (
  ayahReflectionsUrl: string,
): Promise<AyahReflectionsResponse> => fetcher(ayahReflectionsUrl);

const makeFollowUserUrl = (username: string) => makeQuranReflectApiUrl(`users/${username}/follow`);

const makeIsUserFollowedUrl = (username: string) =>
  makeQuranReflectApiUrl(`users/${username}/followed`);

const putRequest = async <T>(url: string, body: Record<string, unknown>): Promise<T> => {
  return fetcher(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
};

export const followUser = async (username: string) =>
  putRequest<{ success: boolean }>(makeFollowUserUrl(username), {});

export const isUserFollowed = async (username: string): Promise<{ followed: boolean }> => {
  return fetcher(makeIsUserFollowedUrl(username));
};

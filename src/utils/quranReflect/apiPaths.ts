/* eslint-disable @typescript-eslint/naming-convention */

import { fetcher } from '@/api';
import AyahReflectionsRequestParams from '@/types/QuranReflect/AyahReflectionsRequestParams';
import AyahReflectionsResponse from '@/types/QuranReflect/AyahReflectionsResponse';
import Tab from '@/types/QuranReflect/Tab';
import stringify from '@/utils/qs-stringify';
import { localeToQuranReflectLanguageID } from '@/utils/quranReflect/locale';
import { getProxiedServiceUrl, QuranFoundationService } from '@/utils/url';

export const REFLECTION_POST_TYPE_ID = '1';
export const LESSON_POST_TYPE_ID = '2';

const getQuranReflectBaseUrlOverride = (): string => {
  const override = process.env.NEXT_PUBLIC_QURAN_REFLECT_API_BASE_URL;
  return override ? override.replace(/\/+$/, '') : '';
};

export const makeQuranReflectApiUrl = (
  path: string,
  parameters: Record<string, unknown> = {},
): string => {
  const query = Object.keys(parameters).length ? `?${stringify(parameters)}` : '';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const overrideBaseUrl = getQuranReflectBaseUrlOverride();

  if (overrideBaseUrl) {
    return `${overrideBaseUrl}${normalizedPath}${query}`;
  }

  return getProxiedServiceUrl(QuranFoundationService.QURAN_REFLECT, `${normalizedPath}${query}`);
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
  reviewed = true,
  postTypeIds = [],
  reflectionLanguages = [],
}: AyahReflectionsRequestParams) => {
  const normalizedLocale = locale?.split('-')[0]?.toLowerCase() || 'en';
  const isoCodes =
    reflectionLanguages.length > 0
      ? reflectionLanguages.map((code) => code?.split('-')[0]?.toLowerCase())
      : [normalizedLocale];
  const languageIds = Array.from(
    new Set(isoCodes.map((code) => localeToQuranReflectLanguageID(code || 'en'))),
  );

  return makeQuranReflectApiUrl('posts/feed', {
    'filter[references][0][chapterId]': surahId,
    'filter[references][0][from]': ayahNumber,
    'filter[references][0][to]': ayahNumber,
    ...(postTypeIds.length > 0 && { 'filter[postTypeIds]': postTypeIds.join(',') }),
    page,
    tab,
    languages: languageIds.join(','),
    'filter[verifiedOnly]': reviewed,
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

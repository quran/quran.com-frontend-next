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

export const makeQuranReflectApiUrl = (
  path: string,
  parameters: Record<string, unknown> = {},
): string => {
  const query = Object.keys(parameters).length ? `?${stringify(parameters)}` : '';
  return getProxiedServiceUrl(QuranFoundationService.QURAN_REFLECT, `/${path}${query}`);
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
  locales = [],
  page = 1,
  postTypeIds = [],
}: AyahReflectionsRequestParams) => {
  const languageIds = locales.map(localeToQuranReflectLanguageID);
  return makeQuranReflectApiUrl('posts/feed', {
    'filter[references][0][chapterId]': surahId,
    'filter[references][0][from]': ayahNumber,
    'filter[references][0][to]': ayahNumber,
    ...(postTypeIds.length > 0 && { 'filter[postTypeIds]': postTypeIds.join(',') }),
    page,
    tab: Tab.Popular, // always reviewed content
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

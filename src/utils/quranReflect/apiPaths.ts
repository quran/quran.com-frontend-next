/* eslint-disable @typescript-eslint/naming-convention */

import { fetcher } from '@/api';
import AyahReflectionsRequestParams, {
  PostSortBy,
} from '@/types/QuranReflect/AyahReflectionsRequestParams';
import AyahReflectionsResponse from '@/types/QuranReflect/AyahReflectionsResponse';
import Tab from '@/types/QuranReflect/Tab';
import { privateFetcher } from '@/utils/auth/api';
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
}) => makeQuranReflectApiUrl('posts/my-posts', { page, limit });

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isUuid = (value: string) => UUID_PATTERN.test(value);

const makeUserProfileUrl = (userNameOrId: string) =>
  makeQuranReflectApiUrl(
    isUuid(userNameOrId) ? `users/${userNameOrId}` : `users/${userNameOrId}/profile`,
  );

export const makeAyahReflectionsUrl = ({
  surahId,
  ayahNumber,
  locales = [],
  page = 1,
  limit = 10,
  postTypeIds = [],
  sortBy = PostSortBy.Latest,
}: AyahReflectionsRequestParams) => {
  const languageIds = locales.map(localeToQuranReflectLanguageID);
  return makeQuranReflectApiUrl('posts/feed', {
    'filter[references][0][chapterId]': surahId,
    'filter[references][0][from]': ayahNumber,
    'filter[references][0][to]': ayahNumber,
    ...(postTypeIds.length > 0 && { 'filter[postTypeIds]': postTypeIds.join(',') }),
    page,
    limit,
    tab: Tab.QDC, // always reviewed content
    languages: languageIds.join(','),
    sortBy,
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
): Promise<AyahReflectionsResponse> => {
  if (ayahReflectionsUrl.includes('/api/proxy/quran-reflect/')) {
    return privateFetcher(ayahReflectionsUrl);
  }

  return fetcher(ayahReflectionsUrl);
};

const makeFollowUserUrl = (followeeId: string) =>
  makeQuranReflectApiUrl(`users/${followeeId}/toggle-follow`);

const makeLikePostUrl = (postId: number | string) =>
  makeQuranReflectApiUrl(`posts/${postId}/toggle-like`);

const makeIsPostLikedUrl = (postId: number | string) =>
  makeQuranReflectApiUrl(`posts/${postId}/liked`);

const postRequest = async <T>(url: string, body: Record<string, unknown>): Promise<T> => {
  return privateFetcher(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
};

export const followUser = async (followeeId: string) =>
  postRequest<{ followed: boolean }>(makeFollowUserUrl(followeeId), { action: 'follow' });

export const isUserFollowed = async (userNameOrId: string): Promise<{ followed: boolean }> => {
  const response = await privateFetcher<{ followed?: boolean }>(makeUserProfileUrl(userNameOrId));
  return { followed: Boolean(response?.followed) };
};

export const likePost = async (postId: number | string) =>
  postRequest<{ liked: boolean }>(makeLikePostUrl(postId), {});

export const unlikePost = async (postId: number | string) =>
  postRequest<{ liked: boolean }>(makeLikePostUrl(postId), {});

export const isPostLiked = async (postId: number | string): Promise<{ liked: boolean }> => {
  return privateFetcher(makeIsPostLikedUrl(postId));
};

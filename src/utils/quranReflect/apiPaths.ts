/* eslint-disable @typescript-eslint/naming-convention */

import { fetcher } from '@/api';
import AyahReflectionResponse from '@/types/QuranReflect/AyahReflectionResponse';
import AyahReflectionsRequestParams from '@/types/QuranReflect/AyahReflectionsRequestParams';
import AyahReflectionsResponse, {
  ReflectionReference,
} from '@/types/QuranReflect/AyahReflectionsResponse';
import ReflectionUpdateResponse from '@/types/QuranReflect/ReflectionUpdateResponse';
import Tab from '@/types/QuranReflect/Tab';
import stringify from '@/utils/qs-stringify';
import { localeToQuranReflectLanguageID } from '@/utils/quranReflect/locale';
import { getProxiedServiceUrl, QuranFoundationService } from '@/utils/url';

export const REFLECTION_POST_TYPE_ID = '1';
export const LESSON_POST_TYPE_ID = '2';

interface CreateOrUpdateReflectionParams {
  body: string;
  draft?: boolean;
  mentions?: [];
  references?: ReflectionReference[];
}

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
  locale,
  page = 1,
  postTypeIds = [],
}: AyahReflectionsRequestParams) => {
  return makeQuranReflectApiUrl('posts/feed', {
    'filter[references][0][chapterId]': surahId,
    'filter[references][0][from]': ayahNumber,
    'filter[references][0][to]': ayahNumber,
    ...(postTypeIds.length > 0 && { 'filter[postTypeIds]': postTypeIds.join(',') }),
    page,
    tab: Tab.Popular, // always reviewed content
    languages: localeToQuranReflectLanguageID(locale),
    'filter[verifiedOnly]': true,
  });
};

const makeReflectionViewsUrl = (postId: string) => {
  return makeQuranReflectApiUrl(`posts/viewed/${postId}`);
};

const makeQuranReflectPostUrl = (postId: number) => {
  return makeQuranReflectApiUrl(`posts/${postId}`);
};

export const logPostView = async (postId: string): Promise<{ success: boolean }> =>
  fetcher(makeReflectionViewsUrl(postId));

export const getAyahReflections = async (
  ayahReflectionsUrl: string,
): Promise<AyahReflectionsResponse> => fetcher(ayahReflectionsUrl);

export const createReflection = async (
  payload: CreateOrUpdateReflectionParams,
): Promise<ReflectionUpdateResponse> =>
  fetcher(makeQuranReflectApiUrl('posts'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      post: { ...payload, mentions: [], draft: false },
    }),
  });

export const updateReflection = async (
  postId: number,
  payload: CreateOrUpdateReflectionParams,
): Promise<ReflectionUpdateResponse> =>
  fetcher(makeQuranReflectPostUrl(postId), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

export const makeCountPostsWithinRangeUrl = (startVerseKey: string, endVerseKey: string) =>
  makeQuranReflectApiUrl(`posts/count-within-range`, { from: startVerseKey, to: endVerseKey });

export const countPostsWithinRange = (startVerseKey: string, endVerseKey: string) =>
  fetcher(makeCountPostsWithinRangeUrl(startVerseKey, endVerseKey));

export const makeGetReflectionsByVerseKeyUrl = (verseKey: string) =>
  makeQuranReflectApiUrl(`posts/by-verse/${verseKey}`);

export const getReflectionsByVerseKey = async (
  verseKey: string,
): Promise<AyahReflectionsResponse> => fetcher(makeGetReflectionsByVerseKeyUrl(verseKey));

export const getReflectionById = async (postId: number): Promise<AyahReflectionResponse> => {
  return fetcher(makeQuranReflectPostUrl(postId));
};

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

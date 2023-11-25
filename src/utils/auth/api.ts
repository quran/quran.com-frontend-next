/* eslint-disable max-lines */
import { configureRefreshFetch } from 'refresh-fetch';

import { getTimezone } from '../datetime';

import {
  FilterActivityDaysParams,
  ActivityDay,
  UpdateActivityDayBody,
  ActivityDayType,
} from '@/types/auth/ActivityDay';
import ConsentType from '@/types/auth/ConsentType';
import { CreateGoalRequest, Goal, GoalCategory, UpdateGoalRequest } from '@/types/auth/Goal';
import { StreakWithMetadataParams, StreakWithUserMetadata } from '@/types/auth/Streak';
import { Mushaf } from '@/types/QuranReader';
import {
  makeBookmarksUrl,
  makeCompleteSignupUrl,
  makeUserProfileUrl,
  makeDeleteAccountUrl,
  makeBookmarksRangeUrl,
  makeBookmarkUrl,
  makeReadingSessionsUrl,
  makeUserPreferencesUrl,
  makeVerificationCodeUrl,
  makeUserBulkPreferencesUrl,
  makeLogoutUrl,
  makeCompleteAnnouncementUrl,
  makeSyncLocalDataUrl,
  makeRefreshTokenUrl,
  makeCollectionsUrl,
  makeGetBookmarkByCollectionId,
  makeAddCollectionUrl,
  makeBookmarkCollectionsUrl,
  CollectionsQueryParams,
  makeUpdateCollectionUrl,
  BookmarkByCollectionIdQueryParams,
  makeDeleteCollectionUrl,
  makeAddCollectionBookmarkUrl,
  makeDeleteCollectionBookmarkByIdUrl,
  makeDeleteCollectionBookmarkByKeyUrl,
  makeDeleteBookmarkUrl,
  makeActivityDaysUrl,
  makeGoalUrl,
  makeFilterActivityDaysUrl,
  makeStreakUrl,
  makeEstimateRangesReadingTimeUrl,
  makePostReflectionViewsUrl,
  makeUserFeatureFlagsUrl,
  makeUserConsentsUrl,
} from '@/utils/auth/apiPaths';
import { fetcher } from 'src/api';
import CompleteAnnouncementRequest from 'types/auth/CompleteAnnouncementRequest';
import { GetBookmarkCollectionsIdResponse } from 'types/auth/GetBookmarksByCollectionId';
import PreferenceGroup from 'types/auth/PreferenceGroup';
import RefreshToken from 'types/auth/RefreshToken';
import SyncDataType from 'types/auth/SyncDataType';
import SyncUserLocalDataResponse from 'types/auth/SyncUserLocalDataResponse';
import UserPreferencesResponse from 'types/auth/UserPreferencesResponse';
import UserProfile from 'types/auth/UserProfile';
import Bookmark from 'types/Bookmark';
import BookmarksMap from 'types/BookmarksMap';
import BookmarkType from 'types/BookmarkType';
import { Collection } from 'types/Collection';
import CompleteSignupRequest from 'types/CompleteSignupRequest';

type RequestData = Record<string, any>;

const handleErrors = async (res) => {
  const body = await res.json();
  throw new Error(body?.message);
};

/**
 * Execute a POST request
 *
 * @param {string} url
 * @param {RequestData} requestData
 * @returns {Promise<T>}
 */
export const postRequest = <T>(url: string, requestData: RequestData): Promise<T> =>
  privateFetcher(url, {
    method: 'POST',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData),
  });

/**
 * Execute a DELETE request.
 *
 * @param {string} url
 * @param {RequestData} requestData
 * @returns {Promise<T>}
 */
const deleteRequest = <T>(url: string, requestData?: RequestData): Promise<T> =>
  privateFetcher(url, {
    method: 'DELETE',
    ...(requestData && {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    }),
  });

/**
 * Execute a PATCH request.
 *
 * @param {string} url
 * @param {RequestData} requestData
 * @returns {Promise<T>}
 */
const patchRequest = <T>(url: string, requestData?: RequestData): Promise<T> =>
  privateFetcher(url, {
    method: 'PATCH',
    ...(requestData && {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    }),
  });

export const getUserProfile = async (): Promise<UserProfile> =>
  privateFetcher(makeUserProfileUrl());

export const getUserFeatureFlags = async (): Promise<Record<string, boolean>> =>
  privateFetcher(makeUserFeatureFlagsUrl());

export const refreshToken = async (): Promise<RefreshToken> =>
  privateFetcher(makeRefreshTokenUrl());

export const completeSignup = async (data: CompleteSignupRequest): Promise<UserProfile> =>
  postRequest(makeCompleteSignupUrl(), data);

export const completeAnnouncement = async (data: CompleteAnnouncementRequest): Promise<any> => {
  return postRequest(makeCompleteAnnouncementUrl(), data);
};

export const updateUserConsent = async (data: {
  consentType: ConsentType;
  consented: boolean;
}): Promise<any> => {
  return postRequest(makeUserConsentsUrl(), data);
};

export const deleteAccount = async (): Promise<void> => deleteRequest(makeDeleteAccountUrl());

type AddBookmarkParams = {
  key: number;
  mushafId: number;
  type: BookmarkType;
  verseNumber?: number;
};

export const addBookmark = async ({ key, mushafId, type, verseNumber }: AddBookmarkParams) =>
  postRequest(makeBookmarksUrl(mushafId), {
    key,
    mushaf: mushafId,
    type,
    verseNumber,
  });

export const getPageBookmarks = async (
  mushafId: number,
  chapterNumber: number,
  verseNumber: number,
  perPage: number,
): Promise<BookmarksMap> =>
  privateFetcher(makeBookmarksRangeUrl(mushafId, chapterNumber, verseNumber, perPage));

export const getBookmark = async (
  mushafId: number,
  key: number,
  type: BookmarkType,
  verseNumber?: number,
): Promise<Bookmark> => privateFetcher(makeBookmarkUrl(mushafId, key, type, verseNumber));

export const getBookmarkCollections = async (
  mushafId: number,
  key: number,
  type: BookmarkType,
  verseNumber?: number,
): Promise<string[]> =>
  privateFetcher(makeBookmarkCollectionsUrl(mushafId, key, type, verseNumber));

export const addReadingGoal = async ({
  mushafId,
  category,
  ...data
}: CreateGoalRequest): Promise<{ data?: Goal }> =>
  postRequest(makeGoalUrl({ mushafId, type: category }), data);

export const updateReadingGoal = async ({
  mushafId,
  category,
  ...data
}: UpdateGoalRequest): Promise<{ data?: Goal }> =>
  patchRequest(makeGoalUrl({ mushafId, type: category }), data);

export const deleteReadingGoal = async (params: { category: GoalCategory }): Promise<void> =>
  deleteRequest(makeGoalUrl({ type: params.category }));

export const filterReadingDays = async (
  params: FilterActivityDaysParams,
): Promise<{ data: ActivityDay[] }> => privateFetcher(makeFilterActivityDaysUrl(params));

export const getActivityDay = async (type: ActivityDayType): Promise<{ data?: ActivityDay }> =>
  privateFetcher(makeActivityDaysUrl({ type }));

export const addReadingSession = async (chapterNumber: number, verseNumber: number) =>
  postRequest(makeReadingSessionsUrl(), {
    chapterNumber,
    verseNumber,
  });

export const updateActivityDay = async ({
  mushafId,
  type,
  ...body
}: UpdateActivityDayBody): Promise<ActivityDay> =>
  postRequest(makeActivityDaysUrl({ mushafId, type }), body);

export const estimateRangesReadingTime = async (body: {
  ranges: string[];
}): Promise<{ data: { seconds: number } }> => {
  return privateFetcher(makeEstimateRangesReadingTimeUrl(body));
};

export const getStreakWithUserMetadata = async (
  params: StreakWithMetadataParams,
): Promise<{ data: StreakWithUserMetadata }> => privateFetcher(makeStreakUrl(params));

export const syncUserLocalData = async (
  payload: Record<SyncDataType, any>,
): Promise<SyncUserLocalDataResponse> => postRequest(makeSyncLocalDataUrl(), payload);

export const postReflectionViews = async (postId: string): Promise<{ success: boolean }> =>
  postRequest(makePostReflectionViewsUrl(postId), {});

export const getUserPreferences = async (): Promise<UserPreferencesResponse> => {
  const userPreferences = (await privateFetcher(
    makeUserPreferencesUrl(),
  )) as UserPreferencesResponse;
  return userPreferences;
};

export const addOrUpdateUserPreference = async (
  key: string,
  value: any,
  group: PreferenceGroup,
  mushafId?: Mushaf,
) =>
  postRequest(makeUserPreferencesUrl(mushafId), {
    key,
    value,
    group,
  });

export const getCollectionsList = async (
  queryParams: CollectionsQueryParams,
): Promise<{ data: Collection[] }> => {
  return privateFetcher(makeCollectionsUrl(queryParams));
};

export const updateCollection = async (collectionId: string, { name }) => {
  return postRequest(makeUpdateCollectionUrl(collectionId), { name });
};

export const deleteCollection = async (collectionId: string) => {
  return deleteRequest(makeDeleteCollectionUrl(collectionId));
};

export const addCollectionBookmark = async ({ collectionId, key, mushaf, type, verseNumber }) => {
  return postRequest(makeAddCollectionBookmarkUrl(collectionId), {
    collectionId,
    key,
    mushaf,
    type,
    verseNumber,
  });
};

export const deleteCollectionBookmarkById = async (collectionId: string, bookmarkId: string) => {
  return deleteRequest(makeDeleteCollectionBookmarkByIdUrl(collectionId, bookmarkId));
};

export const deleteCollectionBookmarkByKey = async ({
  collectionId,
  key,
  mushaf,
  type,
  verseNumber,
}) => {
  return deleteRequest(makeDeleteCollectionBookmarkByKeyUrl(collectionId), {
    collectionId,
    key,
    mushaf,
    type,
    verseNumber,
  });
};

export const deleteBookmarkById = async (bookmarkId: string) => {
  return deleteRequest(makeDeleteBookmarkUrl(bookmarkId));
};

export const getBookmarksByCollectionId = async (
  collectionId: string,
  queryParams: BookmarkByCollectionIdQueryParams,
): Promise<GetBookmarkCollectionsIdResponse> => {
  return privateFetcher(makeGetBookmarkByCollectionId(collectionId, queryParams));
};

export const addCollection = async (collectionName: string) => {
  return postRequest(makeAddCollectionUrl(), { name: collectionName });
};

export const requestVerificationCode = async (emailToVerify) => {
  return postRequest(makeVerificationCodeUrl(), { email: emailToVerify });
};
export const addOrUpdateBulkUserPreferences = async (
  preferences: Record<PreferenceGroup, any>,
  mushafId: Mushaf,
) => postRequest(makeUserBulkPreferencesUrl(mushafId), preferences);

export const logoutUser = async () => {
  return postRequest(makeLogoutUrl(), {});
};

const shouldRefreshToken = (error) => {
  return error?.message === 'must refresh token';
};

export const withCredentialsFetcher = async <T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> => {
  try {
    const data = await fetcher<T>(input, {
      ...init,
      credentials: 'include',
      headers: {
        ...init?.headers,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'x-timezone': getTimezone(),
      },
    });
    return data;
  } catch (error) {
    await handleErrors(error);
    return null;
  }
};

export const privateFetcher = configureRefreshFetch({
  shouldRefreshToken,
  // @ts-ignore
  refreshToken,
  fetch: withCredentialsFetcher,
});

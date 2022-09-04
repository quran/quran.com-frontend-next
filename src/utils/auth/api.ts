/* eslint-disable max-lines */
import { configureRefreshFetch } from 'refresh-fetch';

import { fetcher } from 'src/api';
import {
  makeBookmarksUrl,
  makeCompleteSignupUrl,
  makeUserProfileUrl,
  makeDeleteAccountUrl,
  makeBookmarksRangeUrl,
  makeIsResourceBookmarkedUrl,
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
  BookmarkByCollectioIdQueryParams,
} from 'src/utils/auth/apiPaths';
import CompleteAnnouncementRequest from 'types/auth/CompleteAnnouncementRequest';
import PreferenceGroup from 'types/auth/PreferenceGroup';
import RefreshToken from 'types/auth/RefreshToken';
import SyncDataType from 'types/auth/SyncDataType';
import SyncUserLocalDataResponse from 'types/auth/SyncUserLocalDataResponse';
import UserPreferencesResponse from 'types/auth/UserPreferencesResponse';
import UserProfile from 'types/auth/UserProfile';
import BookmarksMap from 'types/BookmarksMap';
import BookmarkType from 'types/BookmarkType';
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

export const getUserProfile = async (): Promise<UserProfile> =>
  privateFetcher(makeUserProfileUrl());

export const refreshToken = async (): Promise<RefreshToken> =>
  privateFetcher(makeRefreshTokenUrl());

export const completeSignup = async (data: CompleteSignupRequest): Promise<UserProfile> =>
  postRequest(makeCompleteSignupUrl(), data);

export const completeAnnouncement = async (data: CompleteAnnouncementRequest): Promise<any> => {
  return postRequest(makeCompleteAnnouncementUrl(), data);
};

export const deleteAccount = async (): Promise<void> => deleteRequest(makeDeleteAccountUrl());

type AddOrRemoveBookmarkParams = {
  key: number;
  mushafId: number;
  type: BookmarkType;
  isAdd: boolean;
  verseNumber?: number;
  collectionId?: string;
};

export const addOrRemoveBookmark = async ({
  key,
  mushafId,
  type,
  verseNumber,
  isAdd,
  collectionId,
}: AddOrRemoveBookmarkParams) =>
  postRequest(makeBookmarksUrl(mushafId), {
    key,
    mushaf: mushafId,
    type,
    verseNumber,
    isAdd,
    collectionId,
  });

export const getPageBookmarks = async (
  mushafId: number,
  chapterNumber: number,
  verseNumber: number,
  perPage: number,
): Promise<BookmarksMap> =>
  privateFetcher(makeBookmarksRangeUrl(mushafId, chapterNumber, verseNumber, perPage));

export const getIsResourceBookmarked = async (
  mushafId: number,
  key: number,
  type: BookmarkType,
  verseNumber?: number,
): Promise<boolean> =>
  privateFetcher(makeIsResourceBookmarkedUrl(mushafId, key, type, verseNumber));

export const getBookmarkCollections = async (
  mushafId: number,
  key: number,
  type: BookmarkType,
  verseNumber?: number,
) => privateFetcher(makeBookmarkCollectionsUrl(mushafId, key, type, verseNumber));

export const addReadingSession = async (chapterNumber: number, verseNumber: number) =>
  postRequest(makeReadingSessionsUrl(), {
    chapterNumber,
    verseNumber,
  });

export const syncUserLocalData = async (
  payload: Record<SyncDataType, any>,
): Promise<SyncUserLocalDataResponse> => postRequest(makeSyncLocalDataUrl(), payload);

export const getUserPreferences = async (): Promise<UserPreferencesResponse> => {
  const userPreferences = (await privateFetcher(
    makeUserPreferencesUrl(),
  )) as UserPreferencesResponse;
  return userPreferences;
};

export const addOrUpdateUserPreference = async (key: string, value: any, group: PreferenceGroup) =>
  postRequest(makeUserPreferencesUrl(), {
    key,
    value,
    group,
  });

export const getCollectionsList = async (queryParams: CollectionsQueryParams) => {
  return privateFetcher(makeCollectionsUrl(queryParams));
};

export const updateCollection = async (collectionId: string, { name }) => {
  return postRequest(makeUpdateCollectionUrl(collectionId), { name });
};

export const deleteCollection = async (collectionId: string) => {
  return deleteRequest(makeUpdateCollectionUrl(collectionId));
};

export const getBookmarksByCollectionId = async (
  collectionId: string,
  queryParams: BookmarkByCollectioIdQueryParams,
) => {
  return privateFetcher(makeGetBookmarkByCollectionId(collectionId, queryParams));
};

export const addCollection = async (collectionName: string) => {
  return postRequest(makeAddCollectionUrl(), { name: collectionName });
};

export const requestVerificationCode = async (emailToVerify) => {
  return postRequest(makeVerificationCodeUrl(), { email: emailToVerify });
};
export const addOrUpdateBulkUserPreferences = async (preferences: Record<PreferenceGroup, any>) =>
  postRequest(makeUserBulkPreferencesUrl(), preferences);

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
    const data = await fetcher<T>(input, { ...init, credentials: 'include' });
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

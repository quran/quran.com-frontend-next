import { fetcher, getAvailableReciters } from 'src/api';
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
} from 'src/utils/auth/apiPaths';
import PreferenceGroup from 'types/auth/PreferenceGroup';
import UserPreferencesResponse from 'types/auth/UserPreferencesResponse';
import UserProfile from 'types/auth/UserProfile';
import BookmarksMap from 'types/BookmarksMap';
import BookmarkType from 'types/BookmarkType';
import CompleteSignupRequest from 'types/CompleteSignupRequest';

type RequestData = Record<string, any>;

export const privateFetcher = async <T>(input: RequestInfo, init?: RequestInit): Promise<T> => {
  try {
    const data = await fetcher<T>(input, { ...init, credentials: 'include' });
    return data;
  } catch (res) {
    if (res.status === 401) {
      res.json().then((errBody) => {
        if (typeof window !== 'undefined' && errBody.message) {
          window.location.href = `/login?error=${errBody.message}`;
        }
      });
    }

    throw Error(res);
  }
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    }),
  });

export const getUserProfile = async (): Promise<UserProfile> =>
  privateFetcher(makeUserProfileUrl());

export const completeSignup = async (data: CompleteSignupRequest): Promise<UserProfile> =>
  postRequest(makeCompleteSignupUrl(), data);

export const deleteAccount = async (): Promise<void> => deleteRequest(makeDeleteAccountUrl());

export const addOrRemoveBookmark = async (
  key: number,
  mushafId: number,
  type: BookmarkType,
  isAdd: boolean,
  verseNumber?: number,
) => postRequest(makeBookmarksUrl(mushafId), { key, mushaf: mushafId, type, verseNumber, isAdd });

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

export const addReadingSession = async (chapterNumber: number, verseNumber: number) =>
  postRequest(makeReadingSessionsUrl(), {
    chapterNumber,
    verseNumber,
  });

export const getUserPreferences = async (locale: string): Promise<UserPreferencesResponse> => {
  const userPreferences = (await privateFetcher(
    makeUserPreferencesUrl(),
  )) as UserPreferencesResponse;
  // if the audio Preferences are saved in the DB
  if (userPreferences[PreferenceGroup.AUDIO]) {
    const { reciter: reciterId } = userPreferences[PreferenceGroup.AUDIO];
    if (reciterId) {
      // we need to convert the id into reciter data
      const recitersResponse = await getAvailableReciters(locale);
      const selectedReciters = recitersResponse.reciters.filter(
        (reciter) => reciter.id === Number(reciterId),
      );
      if (selectedReciters.length) {
        const [selectedReciter] = selectedReciters;
        userPreferences[PreferenceGroup.AUDIO] = {
          ...userPreferences[PreferenceGroup.AUDIO],
          reciter: selectedReciter,
        };
      }
    }
  }
  return userPreferences;
};

export const addOrUpdateUserPreference = async (key: string, value: any, group: PreferenceGroup) =>
  postRequest(makeUserPreferencesUrl(), {
    key,
    value,
    group,
  });

export const requestVerificationCode = async (emailToVerify) => {
  return postRequest(makeVerificationCodeUrl(), { email: emailToVerify });
};
export const addOrUpdateBulkUserPreferences = async (preferences: Record<PreferenceGroup, any>) =>
  postRequest(makeUserBulkPreferencesUrl(), preferences);

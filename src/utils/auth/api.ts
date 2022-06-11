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
} from 'src/utils/auth/apiPaths';
import PreferenceGroup from 'types/auth/PreferenceGroup';
import UserPreferencesResponse from 'types/auth/UserPreferencesResponse';
import UserProfile from 'types/auth/UserProfile';
import BookmarksMap from 'types/BookmarksMap';
import BookmarkType from 'types/BookmarkType';
import CompleteSignupRequest from 'types/CompleteSignupRequest';

type RequestData = Record<string, any>;

export const privateFetcher = async <T>(input: RequestInfo, init?: RequestInit): Promise<T> => {
  return fetcher(input, { ...init, credentials: 'include' });
};

/**
 * Execute a POST request
 *
 * @param {string} url
 * @param {RequestData} requestData
 * @returns {Promise<T>}
 */
const postRequest = <T>(url: string, requestData: RequestData): Promise<T> =>
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
  const audioPreferencesIndex = userPreferences.findIndex(
    (userPreference) => userPreference.group === PreferenceGroup.AUDIO,
  );
  // if the audio Preferences are saved in the DB
  if (audioPreferencesIndex !== -1) {
    const audioPreference = userPreferences[audioPreferencesIndex];
    const { reciter: reciterId } = audioPreference.value;
    if (reciterId) {
      // we need to convert the id into reciter data
      const recitersResponse = await getAvailableReciters(locale);
      const selectedReciters = recitersResponse.reciters.filter(
        (reciter) => reciter.id === Number(reciterId),
      );
      if (selectedReciters.length) {
        const [selectedReciter] = selectedReciters;
        userPreferences[audioPreferencesIndex] = {
          ...audioPreference,
          value: { ...userPreferences[audioPreferencesIndex].value, reciter: selectedReciter },
        };
      }
    }
  }
  return userPreferences;
};

export const addOrUpdateUserPreference = async (value: any, group: PreferenceGroup) =>
  postRequest(makeUserPreferencesUrl(), {
    value,
    group,
  });

export const deleteUserPreference = async (group: PreferenceGroup) =>
  deleteRequest(makeUserPreferencesUrl(), {
    key,
    group,
  });

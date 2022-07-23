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
  makeLogoutUrl,
  makeCompleteAnnouncementUrl,
} from 'src/utils/auth/apiPaths';
import CompleteAnnouncementRequest from 'types/auth/CompleteAnnouncementRequest';
import PreferenceGroup from 'types/auth/PreferenceGroup';
import UserPreferencesResponse from 'types/auth/UserPreferencesResponse';
import UserProfile from 'types/auth/UserProfile';
import BookmarksMap from 'types/BookmarksMap';
import BookmarkType from 'types/BookmarkType';
import CompleteSignupRequest from 'types/CompleteSignupRequest';

type RequestData = Record<string, any>;

type ErrorContext = {
  status: number;
  body: any;
};

/**
 * If the response is 401 (unauthorized)
 * redirect to login page and show the error message
 */
const handle401Error = async (context: ErrorContext, next) => {
  const { body, status } = context;
  if (status !== 401) {
    next();
    return;
  }

  /**
   * If this function is called on client side, and the error has a `message`
   * redirect to login page and show the error message.
   *
   * But, if user is already on the login page, and showing the error. Do nothing
   */
  if (typeof window !== 'undefined' && body.message) {
    const urlToRedirect = `/login?error=${body.message}`;
    if (window.location.href.endsWith(urlToRedirect)) {
      next();
      return;
    }

    window.location.href = urlToRedirect;
  }
};

const handleErrors = async (res) => {
  const { status } = res;
  const body = await res.json();
  const context = { status, body };

  // TODO: make it more generic to support multiple middleware and support async
  await handle401Error(context, () => {
    throw new Error(body?.message);
  });
};

export const privateFetcher = async <T>(input: RequestInfo, init?: RequestInit): Promise<T> => {
  try {
    const data = await fetcher<T>(input, { ...init, credentials: 'include' });
    return data;
  } catch (res) {
    await handleErrors(res);
    return null;
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

export const completeAnnouncement = async (data: CompleteAnnouncementRequest): Promise<any> => {
  return postRequest(makeCompleteAnnouncementUrl(), data);
};

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

export const logoutUser = async () => {
  return postRequest(makeLogoutUrl(), {});
};

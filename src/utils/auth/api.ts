/* eslint-disable max-lines */
import { configureRefreshFetch } from 'refresh-fetch';

import { getTimezone } from '../datetime';
import { prepareGenerateMediaFileRequestData } from '../media/utils';

import BookmarkByCollectionIdQueryParams from './types/BookmarkByCollectionIdQueryParams';
import GetAllNotesQueryParams from './types/Note/GetAllNotesQueryParams';

import {
  FilterActivityDaysParams,
  QuranActivityDay,
  UpdateQuranActivityDayBody,
  ActivityDayType,
  UpdateActivityDayBody,
  ActivityDay,
  UpdateLessonActivityDayBody,
  UpdateActivityDayParams,
} from '@/types/auth/ActivityDay';
import ConsentType from '@/types/auth/ConsentType';
import { Course } from '@/types/auth/Course';
import { CreateGoalRequest, Goal, GoalCategory, UpdateGoalRequest } from '@/types/auth/Goal';
import { Note } from '@/types/auth/Note';
import { Response } from '@/types/auth/Response';
import { StreakWithMetadataParams, StreakWithUserMetadata } from '@/types/auth/Streak';
import GenerateMediaFileRequest, { MediaType } from '@/types/Media/GenerateMediaFileRequest';
import MediaRenderError from '@/types/Media/MediaRenderError';
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
  makeUserFeatureFlagsUrl,
  makeUserConsentsUrl,
  makeNotesUrl,
  makeDeleteOrUpdateNoteUrl,
  makeCountNotesWithinRangeUrl,
  makeEnrollUserUrl,
  makeGetCoursesUrl,
  makeGetCourseUrl,
  makePublishNoteUrl,
  makeCourseFeedbackUrl,
  makeGetUserCoursesCountUrl,
  makeGenerateMediaFileUrl,
  makeGetMediaFileProgressUrl,
  makeGetMonthlyMediaFilesCountUrl,
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

const IGNORE_ERRORS = [
  MediaRenderError.MediaVersesRangeLimitExceeded,
  MediaRenderError.MediaFilesPerUserLimitExceeded,
];

const handleErrors = async (res) => {
  const body = await res.json();
  // sometimes FE needs to handle the error from the API instead of showing a general something went wrong message
  const shouldIgnoreError = IGNORE_ERRORS.includes(body?.error?.code);
  if (shouldIgnoreError) {
    return body;
  }
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
): Promise<{ data: ActivityDay<QuranActivityDay>[] }> =>
  privateFetcher(makeFilterActivityDaysUrl(params));

export const getActivityDay = async (
  type: ActivityDayType,
): Promise<{ data?: ActivityDay<QuranActivityDay> }> =>
  privateFetcher(makeActivityDaysUrl({ type }));

export const addReadingSession = async (chapterNumber: number, verseNumber: number) =>
  postRequest(makeReadingSessionsUrl(), {
    chapterNumber,
    verseNumber,
  });

export const updateActivityDay = async (
  params: UpdateActivityDayParams,
): Promise<ActivityDay<QuranActivityDay>> => {
  if (params.type === ActivityDayType.QURAN) {
    const { mushafId, type, ...body } = params as UpdateActivityDayBody<UpdateQuranActivityDayBody>;
    return postRequest(makeActivityDaysUrl({ mushafId, type }), body);
  }
  const { type, ...body } = params as UpdateActivityDayBody<UpdateLessonActivityDayBody>;
  return postRequest(makeActivityDaysUrl({ type }), body);
};

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

export const enrollUser = async (courseId: string): Promise<{ success: boolean }> =>
  postRequest(makeEnrollUserUrl(), {
    courseId,
  });

export const postCourseFeedback = async ({
  courseId,
  rating,
  body,
}: {
  courseId: string;
  rating: number;
  body?: string;
}): Promise<{ success: boolean }> =>
  postRequest(makeCourseFeedbackUrl(courseId), {
    rating,
    body,
  });

export const getCourses = async (): Promise<Course[]> => privateFetcher(makeGetCoursesUrl());

export const getCourse = async (courseSlugOrId: string): Promise<Course> =>
  privateFetcher(makeGetCourseUrl(courseSlugOrId));

export const getUserCoursesCount = async (): Promise<{ count: number }> =>
  privateFetcher(makeGetUserCoursesCountUrl());

export const addCollection = async (collectionName: string) => {
  return postRequest(makeAddCollectionUrl(), { name: collectionName });
};

export const getAllNotes = async (params: GetAllNotesQueryParams) => {
  return privateFetcher(makeNotesUrl(params));
};

export const countNotesWithinRange = async (from: string, to: string) => {
  return privateFetcher(makeCountNotesWithinRangeUrl(from, to));
};

export const addNote = async (payload: Pick<Note, 'body' | 'ranges' | 'saveToQR'>) => {
  return postRequest(makeNotesUrl(), payload);
};

export const publishNoteToQR = async (
  noteId: string,
  payload: {
    body: string;
    ranges?: string[];
  },
): Promise<{ success: boolean; postId: string }> =>
  postRequest(makePublishNoteUrl(noteId), payload);

export const updateNote = async (id: string, body: string, saveToQR: boolean) =>
  patchRequest(makeDeleteOrUpdateNoteUrl(id), {
    body,
    saveToQR,
  });

export const deleteNote = async (id: string) => deleteRequest(makeDeleteOrUpdateNoteUrl(id));

export const getMediaFileProgress = async (
  renderId: string,
): Promise<Response<{ isDone: boolean; progress: number; url?: string }>> =>
  privateFetcher(makeGetMediaFileProgressUrl(renderId));

export const getMonthlyMediaFilesCount = async (
  type: MediaType,
): Promise<Response<{ count: number; limit: number }>> =>
  privateFetcher(makeGetMonthlyMediaFilesCountUrl(type));

export const generateMediaFile = async (
  payload: GenerateMediaFileRequest,
): Promise<Response<{ renderId?: string; url?: string }>> => {
  return postRequest(makeGenerateMediaFileUrl(), prepareGenerateMediaFileRequestData(payload));
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
    return handleErrors(error);
  }
};

export const privateFetcher = configureRefreshFetch({
  shouldRefreshToken,
  // @ts-ignore
  refreshToken,
  fetch: withCredentialsFetcher,
});

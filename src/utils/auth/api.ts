/* eslint-disable max-lines */
import { NextApiRequest } from 'next';
import Router from 'next/router';
import { configureRefreshFetch } from 'refresh-fetch';

import { getTimezone } from '../datetime';
import { prepareGenerateMediaFileRequestData } from '../media/utils';

import { BANNED_USER_ERROR_ID } from './constants';
import { AuthErrorCodes } from './errors';
import BookmarkByCollectionIdQueryParams from './types/BookmarkByCollectionIdQueryParams';
import GetAllNotesQueryParams from './types/Note/GetAllNotesQueryParams';
import { ShortenUrlResponse } from './types/ShortenUrl';

import { fetcher } from '@/api';
import { addSentryBreadcrumb, logErrorToSentry } from '@/lib/sentry';
import {
  ActivityDay,
  ActivityDayType,
  FilterActivityDaysParams,
  QuranActivityDay,
  UpdateActivityDayBody,
  UpdateActivityDayParams,
  UpdateLessonActivityDayBody,
  UpdateQuranActivityDayBody,
  UpdateQuranReadingProgramActivityDayBody,
} from '@/types/auth/ActivityDay';
import ConsentType from '@/types/auth/ConsentType';
import { Course } from '@/types/auth/Course';
import { CreateGoalRequest, Goal, GoalCategory, UpdateGoalRequest } from '@/types/auth/Goal';
import { Note } from '@/types/auth/Note';
import QuranProgramWeekResponse from '@/types/auth/QuranProgramWeekResponse';
import { Response } from '@/types/auth/Response';
import { StreakWithMetadataParams, StreakWithUserMetadata } from '@/types/auth/Streak';
import UserProgramResponse from '@/types/auth/UserProgramResponse';
import Language from '@/types/Language';
import GenerateMediaFileRequest, { MediaType } from '@/types/Media/GenerateMediaFileRequest';
import MediaRenderError from '@/types/Media/MediaRenderError';
import QuestionResponse from '@/types/QuestionsAndAnswers/QuestionResponse';
import QuestionType from '@/types/QuestionsAndAnswers/QuestionType';
import { Mushaf } from '@/types/QuranReader';
import {
  CollectionsQueryParams,
  makeActivityDaysUrl,
  makeAddCollectionBookmarkUrl,
  makeAddCollectionUrl,
  makeBookmarkCollectionsUrl,
  makeBookmarksRangeUrl,
  makeBookmarksUrl,
  makeBookmarkUrl,
  makeCollectionsUrl,
  makeCompleteAnnouncementUrl,
  makeCompleteSignupUrl,
  makePublishNoteUrl,
  makeCountNotesWithinRangeUrl,
  makeCountQuestionsWithinRangeUrl,
  makeCourseFeedbackUrl,
  makeDeleteAccountUrl,
  makeDeleteBookmarkUrl,
  makeDeleteCollectionBookmarkByIdUrl,
  makeDeleteCollectionBookmarkByKeyUrl,
  makeDeleteCollectionUrl,
  makeDeleteOrUpdateNoteUrl,
  makeEnrollUserUrl,
  makeEstimateRangesReadingTimeUrl,
  makeFilterActivityDaysUrl,
  makeFullUrlById,
  makeGenerateMediaFileUrl,
  makeGetBookmarkByCollectionId,
  makeGetCoursesUrl,
  makeGetCourseUrl,
  makeEnrollUserInQuranProgramUrl,
  makeGetMediaFileProgressUrl,
  makeGetMonthlyMediaFilesCountUrl,
  makeGetNoteByIdUrl,
  makeGetNotesByVerseUrl,
  makeGetQuestionByIdUrl,
  makeGetQuestionsByVerseKeyUrl,
  makeGetUserCoursesCountUrl,
  makeGetUserQuranProgramUrl,
  makeGoalUrl,
  makeLogoutUrl,
  makeNotesUrl,
  makeReadingSessionsUrl,
  makeRefreshTokenUrl,
  makeShortenUrlUrl,
  makeStreakUrl,
  makeSyncLocalDataUrl,
  makeUpdateCollectionUrl,
  makeUserBulkPreferencesUrl,
  makeUserConsentsUrl,
  makeUserFeatureFlagsUrl,
  makeUserPreferencesUrl,
  makeUserProfileUrl,
  makeVerificationCodeUrl,
  makeGetQuranicWeekUrl,
} from '@/utils/auth/apiPaths';
import { getAdditionalHeaders } from '@/utils/headers';
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
  AuthErrorCodes.InvalidCredentials,
  AuthErrorCodes.NotFound,
  AuthErrorCodes.BadRequest,
  AuthErrorCodes.Invalid,
  AuthErrorCodes.Mismatch,
  AuthErrorCodes.Missing,
  AuthErrorCodes.Duplicate,
  AuthErrorCodes.Banned,
  AuthErrorCodes.Expired,
  AuthErrorCodes.Used,
  AuthErrorCodes.Immutable,
  AuthErrorCodes.ValidationError,
];

/**
 * Checks if an API response contains error information and throws an error if it does.
 * This is useful for handling responses from APIs that return error information in the response body
 * instead of rejecting the promise (like when ValidationError is in IGNORE_ERRORS).
 *
 * @param {unknown} response - The API response to check
 * @param {string} [errorMessage] - Optional custom error message to throw
 * @throws {Error} If the response contains error information
 * @returns {void}
 */
export const throwIfResponseContainsError = (response: unknown, errorMessage?: string): void => {
  if (
    response &&
    typeof response === 'object' &&
    ((response as any).error ||
      (response as any).details?.error ||
      (response as any).success === false)
  ) {
    const message =
      errorMessage ||
      (response as any).error?.message ||
      (response as any).details?.error?.message ||
      'API request failed';
    throw new Error(message);
  }
};

const handleErrors = async (res) => {
  const body = await res.json();
  const error = body?.error || body?.details?.error;
  const errorName = body?.name || body?.details?.name;

  // sometimes FE needs to handle the error from the API instead of showing a general something went wrong message
  const shouldIgnoreError = IGNORE_ERRORS.includes(error?.code);
  if (shouldIgnoreError) {
    return body;
  }
  // const toast = useToast();

  if (errorName === BANNED_USER_ERROR_ID) {
    await logoutUser();
    return Router.push(`/login?error=${errorName}`);
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

// Track token refresh progress to allow UI / logic to defer actions while refreshing
let tokenRefreshInProgress = false;
export const isTokenRefreshInProgress = () => tokenRefreshInProgress;

const refreshTokenWithFlag = async (): Promise<RefreshToken> => {
  if (!tokenRefreshInProgress) {
    tokenRefreshInProgress = true;
    addSentryBreadcrumb('auth.refresh', 'token refresh start');
  }
  try {
    const result = await refreshToken();
    addSentryBreadcrumb('auth.refresh', 'token refresh success');
    return result;
  } catch (e) {
    addSentryBreadcrumb('auth.refresh', 'token refresh failure');
    logErrorToSentry(e, {
      transactionName: 'auth.refresh',
    });
    throw e;
  } finally {
    tokenRefreshInProgress = false;
  }
};

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
  if (params.type === ActivityDayType.QURAN_READING_PROGRAM) {
    const { type, ...body } =
      params as UpdateActivityDayBody<UpdateQuranReadingProgramActivityDayBody>;
    return postRequest(makeActivityDaysUrl({ type }), body);
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

type QuestionTypes = {
  [key in QuestionType]?: number;
};

export type QuestionsData = { total: number; types: QuestionTypes };

export const countQuestionsWithinRange = async (
  from: string,
  to: string,
  language: Language,
): Promise<Record<string, QuestionsData>> => {
  return privateFetcher(makeCountQuestionsWithinRangeUrl(from, to, language));
};

export const getAllNotes = async (params: GetAllNotesQueryParams) => {
  return privateFetcher(makeNotesUrl(params));
};

export const countNotesWithinRange = async (from: string, to: string) => {
  return privateFetcher(makeCountNotesWithinRangeUrl(from, to));
};

export const getAyahQuestions = async (ayahKey: string, language: Language) => {
  return privateFetcher(
    makeGetQuestionsByVerseKeyUrl({
      verseKey: ayahKey,
      language,
    }),
  );
};

export const getQuestionById = async (questionId: string): Promise<QuestionResponse> => {
  return privateFetcher(makeGetQuestionByIdUrl(questionId));
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

export const getNoteById = async (id: string): Promise<Note> =>
  privateFetcher(makeGetNoteByIdUrl(id));

export const getNotesByVerse = async (verseKey: string): Promise<Note[]> => {
  addSentryBreadcrumb('notes.split', 'fetching notes by verse', { verseKey });

  const notes: Note[] = await privateFetcher(makeGetNotesByVerseUrl(verseKey));

  addSentryBreadcrumb('notes.split', 'fetched notes', {
    notesCount: notes.length,
  });

  return notes;
};

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

/**
 * Shorten a URL.
 *
 * @param {string} url
 * @returns {Promise<ShortenUrlResponse>}
 */
export const shortenUrl = async (url: string): Promise<ShortenUrlResponse> => {
  return postRequest(makeShortenUrlUrl(), { url });
};

/**
 * Get full URL by id.
 *
 * @param {string} id
 * @returns {Promise<ShortenUrlResponse>}
 */
export const getFullUrlById = async (id: string): Promise<ShortenUrlResponse> => {
  return privateFetcher(makeFullUrlById(id));
};

export const getUserPrograms = async ({
  programId,
}: {
  programId: string;
}): Promise<{ data: UserProgramResponse }> => {
  return privateFetcher(makeGetUserQuranProgramUrl(programId));
};

export const enrollUserInQuranProgram = async (
  programId: string,
): Promise<{ success: boolean }> => {
  return postRequest(makeEnrollUserInQuranProgramUrl(), {
    programId,
  });
};

export const getQuranProgramWeek = async (
  programId: string,
  weekId: string,
): Promise<{ data: QuranProgramWeekResponse }> => {
  return privateFetcher(makeGetQuranicWeekUrl(programId, weekId));
};

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
    const request: NextApiRequest = {
      url: typeof input === 'string' ? input : input.url,
      method: init?.method || 'GET',
      body: init?.body,
      headers: init?.headers,
      query: {},
    } as NextApiRequest;
    const additionalHeaders = getAdditionalHeaders(request);
    const data = await fetcher<T>(input, {
      ...init,
      credentials: 'include',
      headers: {
        ...init?.headers,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'x-timezone': getTimezone(),
        ...additionalHeaders,
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
  refreshToken: refreshTokenWithFlag,
  fetch: withCredentialsFetcher,
});

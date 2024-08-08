import stringify from '../qs-stringify';

import BookmarkByCollectionIdQueryParams from './types/BookmarkByCollectionIdQueryParams';
import GetNoteByAttachedEntityParams from './types/GetNoteByAttachedEntityParams';
import GetAllNotesQueryParams from './types/Note/GetAllNotesQueryParams';

import { ActivityDayType, FilterActivityDaysParams } from '@/types/auth/ActivityDay';
import { EstimateGoalRequest, GoalCategory } from '@/types/auth/Goal';
import { StreakWithMetadataParams } from '@/types/auth/Streak';
import { MediaType } from '@/types/Media/GenerateMediaFileRequest';
import { Mushaf } from '@/types/QuranReader';
import { getAuthApiPath } from '@/utils/url';
import BookmarkType from 'types/BookmarkType';

export const makeUrl = (url: string, parameters?: Record<string, unknown>): string => {
  if (!parameters) {
    return getAuthApiPath(url);
  }
  return getAuthApiPath(`${url}${`?${stringify(parameters)}`}`);
};

export const makeUserProfileUrl = (): string => makeUrl('users/profile');

export const makeUserFeatureFlagsUrl = (): string => makeUrl('feature-flags');

export const makeUserConsentsUrl = (): string => makeUrl('consent/userConsents');

export const makeCompleteSignupUrl = (): string => makeUrl('users/completeSignup');

export const makeCompleteAnnouncementUrl = (): string => makeUrl('users/completeAnnouncement');

export const makeDeleteAccountUrl = (): string => makeUrl('users/deleteAccount');

export const makeSyncLocalDataUrl = (): string => makeUrl('users/syncLocalData');

export const makeVerificationCodeUrl = (): string => makeUrl('users/verificationCode');

export const makeSendMagicLinkUrl = (redirect?: string): string =>
  makeUrl('auth/magiclogin', redirect ? { redirect } : undefined);

export const makeGoogleLoginUrl = (redirect?: string): string =>
  makeUrl('auth/google', redirect ? { redirect } : undefined);

export const makeFacebookLoginUrl = (redirect?: string): string =>
  makeUrl('auth/facebook', redirect ? { redirect } : undefined);

export const makeAppleLoginUrl = (redirect?: string): string =>
  makeUrl('auth/apple', redirect ? { redirect } : undefined);

export const makeBookmarksUrl = (mushafId: number, limit?: number): string =>
  makeUrl('bookmarks', { mushafId, limit });

export type CollectionsQueryParams = {
  cursor?: string;
  limit?: number;
  sortBy?: string;
};
export const makeCollectionsUrl = (queryParams: CollectionsQueryParams): string =>
  makeUrl('collections', queryParams);

export const makeAddCollectionUrl = () => makeUrl('collections');

export const makeGetNotesByVerseUrl = (verseKey: string) => makeUrl(`notes/by-verse/${verseKey}`);

export const makeGetNoteByIdUrl = (id: string) => makeUrl(`notes/${id}`);

export const makeCountNotesWithinRangeUrl = (startVerseKey: string, endVerseKey: string) =>
  makeUrl(`notes/count-within-range`, { from: startVerseKey, to: endVerseKey });

export const makeNotesUrl = (params?: GetAllNotesQueryParams) => makeUrl('notes', params as any);

export const makeGetNoteByAttachedEntityUrl = (queryParams: GetNoteByAttachedEntityParams) =>
  makeUrl(`notes`, queryParams);

export const makeDeleteOrUpdateNoteUrl = (id: string) => makeUrl(`notes/${id}`);

export const makePublishNoteUrl = (id: string) => makeUrl(`notes/${id}/publish`);

export const makeGetCoursesUrl = (params?: { myCourses: boolean }) => makeUrl('courses', params);

export const makeGetCourseUrl = (courseSlugOrId: string) => makeUrl(`courses/${courseSlugOrId}`);

export const makeGetLessonUrlPrefix = (courseSlugOrId: string) =>
  makeUrl(`courses/${courseSlugOrId}/lessons`);

export const makeGetLessonUrl = (courseSlugOrId: string, lessonSlugOrId: string) =>
  `${makeGetLessonUrlPrefix(courseSlugOrId)}/${lessonSlugOrId}`;

export const makeEnrollUserUrl = () => makeUrl('courses/enroll');
export const makeGetUserCoursesCountUrl = () => makeUrl('courses/count');

export const makeCourseFeedbackUrl = (courseId: string) => makeUrl(`courses/${courseId}/feedback`);

export const makeUpdateCollectionUrl = (collectionId: string) =>
  makeUrl(`collections/${collectionId}`);

export const makeDeleteCollectionUrl = (collectionId: string) =>
  makeUrl(`collections/${collectionId}`);

export const makeAddCollectionBookmarkUrl = (collectionId: string) =>
  makeUrl(`collections/${collectionId}/bookmarks`);

export const makeDeleteCollectionBookmarkByIdUrl = (collectionId: string, bookmarkId: string) =>
  makeUrl(`collections/${collectionId}/bookmarks/${bookmarkId}`);

export const makeDeleteCollectionBookmarkByKeyUrl = (collectionId: string) =>
  makeUrl(`collections/${collectionId}/bookmarks`);

export const makePostReflectionViewsUrl = (postId: string) => makeUrl(`posts/${postId}/views`);

export const makeBookmarkCollectionsUrl = (
  mushafId: number,
  key: number,
  type: BookmarkType,
  verseNumber?: number,
): string =>
  makeUrl('bookmarks/collections', { mushafId, key, type, ...(verseNumber && { verseNumber }) });

export const makeGetBookmarkByCollectionId = (
  collectionId: string,
  queryParams: BookmarkByCollectionIdQueryParams,
) => makeUrl(`collections/${collectionId}`, queryParams);

export const makeAllCollectionsItemsUrl = (queryParams: BookmarkByCollectionIdQueryParams) =>
  makeUrl(`collections/all`, queryParams);

export const makeDeleteBookmarkUrl = (bookmarkId: string) => makeUrl(`bookmarks/${bookmarkId}`);

export const makeBookmarksRangeUrl = (
  mushafId: number,
  chapterNumber: number,
  verseNumber: number,
  perPage: number,
): string => makeUrl('bookmarks/ayahs-range', { mushafId, chapterNumber, verseNumber, perPage });

export const makeBookmarkUrl = (
  mushafId: number,
  key: number,
  type: BookmarkType,
  verseNumber?: number,
): string =>
  makeUrl('bookmarks/bookmark', { mushafId, key, type, ...(verseNumber && { verseNumber }) });

export const makeReadingSessionsUrl = () => makeUrl('reading-sessions');

export const makeActivityDaysUrl = (params: { mushafId?: Mushaf; type: ActivityDayType }) =>
  makeUrl('activity-days', params);

export const makeFilterActivityDaysUrl = (params: FilterActivityDaysParams) =>
  makeUrl('activity-days/filter', params);

export const makeEstimateRangesReadingTimeUrl = (params: { ranges: string[] }) =>
  makeUrl('activity-days/estimate-reading-time', { ranges: params.ranges.join(',') });

export const makeGoalUrl = (params: { mushafId?: Mushaf; type: GoalCategory }) =>
  makeUrl('goal', params);

export const makeEstimateReadingGoalUrl = (data: EstimateGoalRequest) =>
  makeUrl('goal/estimate', data);

export const makeStreakUrl = (params?: StreakWithMetadataParams) => makeUrl('streak', params);

export const makeReadingGoalProgressUrl = (mushafId: Mushaf) =>
  makeUrl('goal/status', {
    mushafId,
  });

export const makeUserPreferencesUrl = (mushafId?: Mushaf) =>
  makeUrl(
    'preferences',
    mushafId && {
      mushafId,
    },
  );

export const makeUserBulkPreferencesUrl = (mushafId: Mushaf) =>
  makeUrl('preferences/bulk', {
    mushafId,
  });

export const makeLogoutUrl = () => makeUrl('auth/logout');

export const makeRefreshTokenUrl = () => makeUrl('tokens/refreshToken');

export const makeGenerateMediaFileUrl = () => makeUrl('media/generate');

export const makeGetMediaFileProgressUrl = (renderId: string) =>
  makeUrl(`media/progress/${renderId}`);

export const makeGetMonthlyMediaFilesCountUrl = (type: MediaType) =>
  makeUrl(`media/monthly-count`, { type });

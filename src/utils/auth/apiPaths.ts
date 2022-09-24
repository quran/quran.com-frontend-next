import stringify from '../qs-stringify';

import { getAuthApiPath } from '@/utils/url';
import BookmarkType from 'types/BookmarkType';

const makeUrl = (url: string, parameters?: Record<string, unknown>): string => {
  if (!parameters) {
    return getAuthApiPath(url);
  }
  return getAuthApiPath(`${url}${`?${stringify(parameters)}`}`);
};

export const makeUserProfileUrl = (): string => makeUrl('users/profile');

export const makeCompleteSignupUrl = (): string => makeUrl('users/completeSignup');

export const makeCompleteAnnouncementUrl = (): string => makeUrl('users/completeAnnouncement');

export const makeDeleteAccountUrl = (): string => makeUrl('users/deleteAccount');

export const makeSyncLocalDataUrl = (): string => makeUrl('users/syncLocalData');

export const makeVerificationCodeUrl = (): string => makeUrl('users/verificationCode');

export const makeSendMagicLinkUrl = (): string => makeUrl('auth/magiclogin');

export const makeGoogleLoginUrl = (): string => makeUrl('auth/google');

export const makeFacebookLoginUrl = (): string => makeUrl('auth/facebook');

export const makeAppleLoginUrl = (): string => makeUrl('auth/apple');

export const makeBookmarksUrl = (mushafId: number): string => makeUrl('bookmarks', { mushafId });

export type CollectionsQueryParams = {
  cursor?: string;
  limit?: number;
  sortBy?: string;
};
export const makeCollectionsUrl = (queryParams: CollectionsQueryParams): string =>
  makeUrl('collections', queryParams);

export const makeAddCollectionUrl = () => makeUrl('collections');

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

export const makeBookmarkCollectionsUrl = (
  mushafId: number,
  key: number,
  type: BookmarkType,
  verseNumber?: number,
): string =>
  makeUrl('bookmarks/collections', { mushafId, key, type, ...(verseNumber && { verseNumber }) });

export type BookmarkByCollectionIdQueryParams = {
  cursor?: string;
  limit?: number;
  sortBy?: string;
};
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

export const makeUserPreferencesUrl = () => makeUrl('preferences');

export const makeUserBulkPreferencesUrl = () => makeUrl('preferences/bulk');

export const makeLogoutUrl = () => makeUrl('auth/logout');

export const makeRefreshTokenUrl = () => makeUrl('tokens/refreshToken');

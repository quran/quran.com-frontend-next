import stringify from '../qs-stringify';

import { getAuthApiPath } from 'src/utils/url';
import BookmarkType from 'types/BookmarkType';

const makeUrl = (url: string, parameters?: Record<string, unknown>): string => {
  if (!parameters) {
    return getAuthApiPath(url);
  }
  return getAuthApiPath(`${url}${`?${stringify(parameters)}`}`);
};

export const makeUserProfileUrl = (): string => makeUrl('users/profile');

export const makeCompleteSignupUrl = (): string => makeUrl('users/completeSignup');

export const makeDeleteAccountUrl = (): string => makeUrl('users/deleteAccount');

export const makeSendMagicLinkUrl = (): string => makeUrl('auth/magiclogin');

export const makeGoogleLoginUrl = (): string => makeUrl('auth/google');

export const makeFacebookLoginUrl = (): string => makeUrl('auth/facebook');

export const makeAppleLoginUrl = (): string => makeUrl('auth/apple');

export const makeBookmarksUrl = (mushafId: number): string => makeUrl('bookmarks', { mushafId });

export const makeBookmarksRangeUrl = (
  mushafId: number,
  chapterNumber: number,
  verseNumber: number,
  perPage: number,
): string => makeUrl('bookmarks/ayahs-range', { mushafId, chapterNumber, verseNumber, perPage });

export const makeIsResourceBookmarkedUrl = (
  mushafId: number,
  key: number,
  type: BookmarkType,
  verseNumber?: number,
): string =>
  makeUrl('bookmarks/is-bookmarked', { mushafId, key, type, ...(verseNumber && { verseNumber }) });

export const makeReadingSessionsUrl = () => makeUrl('reading-sessions');

export const makeUserPreferencesUrl = () => makeUrl('preferences');

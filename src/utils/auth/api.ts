import { fetcher } from 'src/api';
import {
  makeBookmarksUrl,
  makeCompleteSignupUrl,
  makeUserProfileUrl,
  makeDeleteAccountUrl,
  makeBookmarksRangeUrl,
  makeIsResourceBookmarkedUrl,
  makeReadingSessionsUrl,
} from 'src/utils/auth/apiPaths';
import BookmarksMap from 'types/BookmarksMap';
import BookmarkType from 'types/BookmarkType';
import CompleteSignupRequest from 'types/CompleteSignupRequest';
import UserProfile from 'types/UserProfile';

export const privateFetcher = async <T>(input: RequestInfo, init?: RequestInit): Promise<T> => {
  return fetcher(input, { ...init, credentials: 'include' });
};

const postRequest = <T>(url: string, body: Record<string, any>): Promise<T> =>
  privateFetcher(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

const deleteRequest = <T>(url: string): Promise<T> => privateFetcher(url, { method: 'DELETE' });

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

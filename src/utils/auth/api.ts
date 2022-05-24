import { fetcher } from 'src/api';
import {
  makeBookmarksUrl,
  makeCompleteSignupUrl,
  makeUserProfileUrl,
  makeDeleteAccountUrl,
} from 'src/utils/auth/apiPaths';
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

export const addOrRemoveBookmark = (chapterNumber: number, verseNumber: number) =>
  postRequest(makeBookmarksUrl(), { chapterNumber, verseNumber });

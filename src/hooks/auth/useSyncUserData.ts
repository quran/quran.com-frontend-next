import { useEffect } from 'react';

import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useSWRConfig } from 'swr';

import { selectBookmarkedPages, selectBookmarks } from '@/redux/slices/QuranReader/bookmarks';
import {
  RecentReadingSessions,
  selectRecentReadingSessions,
} from '@/redux/slices/QuranReader/readingTracker';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { getMushafId } from '@/utils/api';
import { syncUserLocalData } from '@/utils/auth/api';
import { makeReadingSessionsUrl, makeUserProfileUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { getLastSyncAt, setLastSyncAt } from '@/utils/auth/userDataSync';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';
import SyncDataType from 'types/auth/SyncDataType';
import UserProfile from 'types/auth/UserProfile';
import BookmarkType from 'types/BookmarkType';

interface BookmarkPayload {
  key: number;
  type: string;
  verseNumber?: number;
  createdAt: string;
  mushaf: number;
}

type ReadingSessionPayload = {
  updatedAt: string;
  chapterNumber: number;
  verseNumber: number;
};

type SyncPayload = {
  [SyncDataType.BOOKMARKS]: BookmarkPayload[];
  [SyncDataType.READING_SESSIONS]: ReadingSessionPayload[];
};

const formatLocalBookmarkRecord = (
  ayahKey: string,
  bookmarkTimestamp: number,
  mushafId: number,
): BookmarkPayload => {
  const [surahNumber, ayahNumber] = getVerseAndChapterNumbersFromKey(ayahKey);
  return {
    createdAt: new Date(bookmarkTimestamp).toISOString(),
    type: BookmarkType.Ayah,
    key: Number(surahNumber),
    verseNumber: Number(ayahNumber),
    mushaf: mushafId,
  };
};

/**
 * Format a local page bookmark record for syncing with the server
 * @param {string} pageNumber - The page number as a string
 * @param {number} bookmarkTimestamp - The timestamp when the bookmark was created
 * @param {number} mushafId - The mushaf ID
 * @returns {object} Formatted page bookmark record for API
 */
const formatLocalPageBookmarkRecord = (
  pageNumber: string,
  bookmarkTimestamp: number,
  mushafId: number,
): BookmarkPayload => {
  return {
    createdAt: new Date(bookmarkTimestamp).toISOString(),
    type: BookmarkType.Page,
    key: Number(pageNumber),
    mushaf: mushafId,
  };
};

const formatLocalReadingSession = (ayahKey: string, updatedAt: number) => {
  const [surahNumber, ayahNumber] = getVerseAndChapterNumbersFromKey(ayahKey);
  return {
    updatedAt: new Date(updatedAt).toISOString(),
    chapterNumber: Number(surahNumber),
    verseNumber: Number(ayahNumber),
  };
};

/**
 * A hook that will sync local user data e.g. his bookmarks
 * once the user signs up so that he doesn't lose them once
 * he logs in again.
 *
 */
const useSyncUserData = () => {
  const dispatch = useDispatch();
  const { cache, mutate } = useSWRConfig();
  const bookmarkedVerses = useSelector(selectBookmarks, shallowEqual);
  const bookmarkedPages = useSelector(selectBookmarkedPages, shallowEqual);
  const recentReadingSessions: RecentReadingSessions = useSelector(
    selectRecentReadingSessions,
    shallowEqual,
  );
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const { quranFont, mushafLines } = quranReaderStyles;
  const { mushaf: mushafId } = getMushafId(quranFont, mushafLines);
  useEffect(() => {
    // if there is no local last sync stored, we should sync the local data to the DB
    if (isLoggedIn() && !getLastSyncAt()) {
      const requestPayload: SyncPayload = {
        [SyncDataType.BOOKMARKS]: [
          ...Object.keys(bookmarkedVerses).map((ayahKey) =>
            formatLocalBookmarkRecord(ayahKey, bookmarkedVerses[ayahKey], mushafId),
          ),
          ...Object.keys(bookmarkedPages).map((pageNumber) =>
            formatLocalPageBookmarkRecord(pageNumber, bookmarkedPages[pageNumber], mushafId),
          ),
        ],
        [SyncDataType.READING_SESSIONS]: Object.entries(recentReadingSessions).map(
          ([ayahKey, updatedAt]) => formatLocalReadingSession(ayahKey, updatedAt),
        ),
      };

      syncUserLocalData(requestPayload as Record<SyncDataType, any>)
        .then((response) => {
          const { lastSyncAt } = response;
          mutate(
            makeUserProfileUrl(),
            (data: UserProfile | null | undefined) => {
              if (!data) return data;
              return { ...data, lastSyncAt };
            },
            { revalidate: false },
          );
          mutate(makeReadingSessionsUrl());
          setLastSyncAt(new Date(lastSyncAt));
        })
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .catch(() => {});
    }
  }, [bookmarkedVerses, bookmarkedPages, cache, dispatch, mushafId, mutate, recentReadingSessions]);
};
export default useSyncUserData;

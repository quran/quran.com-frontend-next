import { useEffect, useCallback, useRef } from 'react';

import { shallowEqual, useSelector } from 'react-redux';
import { useSWRConfig } from 'swr';

import { logErrorToSentry } from '@/lib/sentry';
import { selectBookmarkedPages, selectBookmarks } from '@/redux/slices/QuranReader/bookmarks';
import {
  RecentReadingSessions,
  selectRecentReadingSessions,
} from '@/redux/slices/QuranReader/readingTracker';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { getMushafId } from '@/utils/api';
import { syncUserLocalData } from '@/utils/auth/api';
import {
  BOOKMARK_CACHE_PATHS,
  makeReadingSessionsUrl,
  makeUserProfileUrl,
} from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { getLastSyncAt, setLastSyncAt } from '@/utils/auth/userDataSync';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';
import SyncDataType, {
  SyncBookmarkPayload,
  SyncLocalDataPayload,
  SyncReadingSessionPayload,
} from 'types/auth/SyncDataType';
import UserProfile from 'types/auth/UserProfile';
import BookmarkType from 'types/BookmarkType';

const MAX_SYNC_ATTEMPTS = 3; // 1 initial + 2 retries
const INITIAL_RETRY_DELAY_MS = 1000;

const formatLocalBookmarkRecord = (
  ayahKey: string,
  bookmarkTimestamp: number,
  mushafId: number,
): SyncBookmarkPayload => {
  const [surahNumber, ayahNumber] = getVerseAndChapterNumbersFromKey(ayahKey);
  return {
    createdAt: new Date(bookmarkTimestamp).toISOString(),
    type: BookmarkType.Ayah,
    key: Number(surahNumber),
    verseNumber: Number(ayahNumber),
    mushaf: mushafId,
  };
};

const formatLocalPageBookmarkRecord = (
  pageNumber: string,
  bookmarkTimestamp: number,
  mushafId: number,
): SyncBookmarkPayload => ({
  createdAt: new Date(bookmarkTimestamp).toISOString(),
  type: BookmarkType.Page,
  key: Number(pageNumber),
  mushaf: mushafId,
});

const formatLocalReadingSession = (
  ayahKey: string,
  updatedAt: number,
): SyncReadingSessionPayload => {
  const [surahNumber, ayahNumber] = getVerseAndChapterNumbersFromKey(ayahKey);
  return {
    updatedAt: new Date(updatedAt).toISOString(),
    chapterNumber: Number(surahNumber),
    verseNumber: Number(ayahNumber),
  };
};

/**
 * Build the sync payload from local bookmarks and reading sessions
 *
 * @param {Record<string, number>} bookmarkedVerses - The bookmarked verses
 * @param {Record<string, number>} bookmarkedPages - The bookmarked pages
 * @param {RecentReadingSessions} recentReadingSessions - The recent reading sessions
 * @param {number} mushafId - The mushaf ID
 * @returns {SyncLocalDataPayload} The sync payload
 */
const buildSyncPayload = (
  bookmarkedVerses: Record<string, number>,
  bookmarkedPages: Record<string, number>,
  recentReadingSessions: RecentReadingSessions,
  mushafId: number,
): SyncLocalDataPayload => ({
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
});

const isBookmarkCacheKey = (key: unknown): boolean =>
  typeof key === 'string' && Object.values(BOOKMARK_CACHE_PATHS).some((p) => key.includes(p));

/**
 * A hook that will sync local user data e.g. his bookmarks
 * once the user signs up so that he doesn't lose them once
 * he logs in again. Includes retry logic with exponential backoff.
 */
const useSyncUserData = () => {
  const { mutate } = useSWRConfig();
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSyncingRef = useRef(false);
  const bookmarkedVerses = useSelector(selectBookmarks, shallowEqual);
  const bookmarkedPages = useSelector(selectBookmarkedPages, shallowEqual);
  const recentReadingSessions: RecentReadingSessions = useSelector(
    selectRecentReadingSessions,
    shallowEqual,
  );
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const { quranFont, mushafLines } = quranReaderStyles;
  const { mushaf: mushafId } = getMushafId(quranFont, mushafLines);

  const performSync = useCallback(
    async (attempt = 0): Promise<void> => {
      const bookmarksCount =
        Object.keys(bookmarkedVerses).length + Object.keys(bookmarkedPages).length;
      const requestPayload = buildSyncPayload(
        bookmarkedVerses,
        bookmarkedPages,
        recentReadingSessions,
        mushafId,
      );
      try {
        const response = await syncUserLocalData(requestPayload);
        const { lastSyncAt } = response;
        mutate(makeUserProfileUrl(), (data: UserProfile) => ({ ...data, lastSyncAt }));
        mutate(makeReadingSessionsUrl());
        mutate(isBookmarkCacheKey, undefined, { revalidate: true });
        setLastSyncAt(new Date(lastSyncAt));
      } catch (error) {
        const readingSessionsCount = Object.keys(recentReadingSessions).length;
        logErrorToSentry(error, {
          transactionName: 'useSyncUserData',
          metadata: { bookmarksCount, readingSessionsCount, mushafId, attempt },
        });
        // Retry with exponential backoff (attempt 0, 1, 2 = 3 total attempts)
        if (attempt < MAX_SYNC_ATTEMPTS - 1) {
          const delay = INITIAL_RETRY_DELAY_MS * 2 ** attempt;
          if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = setTimeout(() => performSync(attempt + 1), delay);
        }
      }
    },
    [bookmarkedVerses, bookmarkedPages, recentReadingSessions, mushafId, mutate],
  );

  useEffect(() => {
    // if there is no local last sync stored, we should sync the local data to the DB
    // isSyncingRef prevents duplicate syncs when performSync is recreated due to dependency changes
    if (isLoggedIn() && !getLastSyncAt() && !isSyncingRef.current) {
      isSyncingRef.current = true;
      performSync().finally(() => {
        isSyncingRef.current = false;
      });
    }
    return () => {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [performSync]);
};

export default useSyncUserData;

/* eslint-disable max-lines */
import { useEffect, useCallback, useRef } from 'react';

import { shallowEqual, useSelector } from 'react-redux';
import { useSWRConfig } from 'swr';

import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import { logErrorToSentry } from '@/lib/sentry';
import { selectIsPersistGateHydrationComplete } from '@/redux/slices/persistGateHydration';
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
import { getLastSyncAt, removeLastSyncAt, setLastSyncAt } from '@/utils/auth/userDataSync';
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

const buildSyncPayload = (
  verses: Record<string, number>,
  pages: Record<string, number>,
  sessions: RecentReadingSessions,
  mushafId: number,
): SyncLocalDataPayload => ({
  [SyncDataType.BOOKMARKS]: [
    ...Object.keys(verses).map((k) => formatLocalBookmarkRecord(k, verses[k], mushafId)),
    ...Object.keys(pages).map((k) => formatLocalPageBookmarkRecord(k, pages[k], mushafId)),
  ],
  [SyncDataType.READING_SESSIONS]: Object.entries(sessions).map(([k, v]) =>
    formatLocalReadingSession(k, v),
  ),
});

const isBookmarkCacheKey = (key: unknown): boolean =>
  typeof key === 'string' &&
  (Object.values(BOOKMARK_CACHE_PATHS).some((p) => key.includes(p)) ||
    key.startsWith('pageBookmark:'));

/** Syncs local user data (bookmarks, reading sessions) to DB on login with retry logic */
const useSyncUserData = () => {
  const { mutate } = useSWRConfig();
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSyncingRef = useRef(false);
  const hasSyncedRef = useRef(false);
  const { isLoggedIn } = useIsLoggedIn();
  const isPersistGateHydrationComplete = useSelector(selectIsPersistGateHydrationComplete);
  const bookmarkedVerses = useSelector(selectBookmarks, shallowEqual);
  const bookmarkedPages = useSelector(selectBookmarkedPages, shallowEqual);
  const recentReadingSessions = useSelector(selectRecentReadingSessions, shallowEqual);
  const { quranFont, mushafLines } = useSelector(selectQuranReaderStyles, shallowEqual);
  const { mushaf: mushafId } = getMushafId(quranFont, mushafLines);

  const performSync = useCallback(
    async (attempt = 0): Promise<void> => {
      const bookmarksCount =
        Object.keys(bookmarkedVerses).length + Object.keys(bookmarkedPages).length;
      // prettier-ignore
      const payload = buildSyncPayload(bookmarkedVerses, bookmarkedPages, recentReadingSessions, mushafId);
      try {
        const { lastSyncAt } = await syncUserLocalData(payload);
        mutate(makeUserProfileUrl(), (data: UserProfile) => ({ ...data, lastSyncAt }));
        mutate(makeReadingSessionsUrl());
        mutate(isBookmarkCacheKey, undefined, { revalidate: true });
        setLastSyncAt(new Date(lastSyncAt));
        hasSyncedRef.current = true;
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
    // Clear lastSyncAt cookie when user is logged out (handles server-side logout via /logout page)
    if (!isLoggedIn) {
      if (getLastSyncAt()) removeLastSyncAt();
      hasSyncedRef.current = false;
      return () => {};
    }
    // Wait for Redux hydration to complete before syncing to ensure we have the full bookmark data
    if (!isPersistGateHydrationComplete) {
      return () => {};
    }
    // Sync local data to DB when user logs in and hasn't synced yet
    // Use hasSyncedRef to track if we've successfully synced (not just started syncing)
    // This ensures we retry if the first sync ran before hydration completed
    if (!getLastSyncAt() && !hasSyncedRef.current && !isSyncingRef.current) {
      isSyncingRef.current = true;
      performSync().finally(() => {
        isSyncingRef.current = false;
      });
    }
    return () => {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [isLoggedIn, isPersistGateHydrationComplete, performSync, bookmarkedVerses, bookmarkedPages]);
};

export default useSyncUserData;

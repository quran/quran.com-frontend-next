import { shallowEqual, useSelector } from 'react-redux';
import { useSWRConfig } from 'swr';

import { selectBookmarks } from 'src/redux/slices/QuranReader/bookmarks';
import { selectRecentReadingSessions } from 'src/redux/slices/QuranReader/readingTracker';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { getMushafId } from 'src/utils/api';
import { syncUserLocalData } from 'src/utils/auth/api';
import {
  makeBookmarksUrl,
  makeReadingSessionsUrl,
  makeUserProfileUrl,
} from 'src/utils/auth/apiPaths';
import { getVerseAndChapterNumbersFromKey } from 'src/utils/verse';
import SyncDataType from 'types/auth/SyncDataType';
import UserProfile from 'types/auth/UserProfile';
import BookmarkType from 'types/BookmarkType';

const formatLocalBookmarkRecord = (
  ayahKey: string,
  bookmarkTimestamp: number,
  mushafId: number,
) => {
  const [surahNumber, ayahNumber] = getVerseAndChapterNumbersFromKey(ayahKey);
  return {
    createdAt: new Date(bookmarkTimestamp).toISOString(),
    type: BookmarkType.Ayah,
    key: Number(surahNumber),
    verseNumber: Number(ayahNumber),
    mushaf: mushafId,
  };
};

const formatLocalReadingSession = (ayahKey: string) => {
  const [surahNumber, ayahNumber] = getVerseAndChapterNumbersFromKey(ayahKey);
  return {
    updatedAt: new Date().toISOString(),
    chapterNumber: Number(surahNumber),
    verseNumber: Number(ayahNumber),
  };
};

/**
 * A hook that will sync local user data e.g. his bookmarks
 * once the user signs up so that he doesn't lose them once
 * he logs in again.
 *
 * @param {boolean|undefined} isLocalDataSynced
 */
const useSyncUserData = (isLocalDataSynced?: boolean) => {
  const { mutate } = useSWRConfig();
  const bookmarkedVerses = useSelector(selectBookmarks, shallowEqual);
  const recentReadingSessions = useSelector(selectRecentReadingSessions, shallowEqual);
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const { quranFont, mushafLines } = quranReaderStyles;
  const { mushaf: mushafId } = getMushafId(quranFont, mushafLines);
  if (isLocalDataSynced === false) {
    const requestPayload = {
      [SyncDataType.BOOKMARKS]: Object.keys(bookmarkedVerses).map((ayahKey) =>
        formatLocalBookmarkRecord(ayahKey, bookmarkedVerses[ayahKey], mushafId),
      ),
      [SyncDataType.READING_SESSIONS]: Object.keys(recentReadingSessions).map((ayahKey) =>
        formatLocalReadingSession(ayahKey),
      ),
    };
    syncUserLocalData(requestPayload)
      .then(() => {
        mutate(makeReadingSessionsUrl(), (data) => ({
          ...data,
          ...requestPayload[SyncDataType.READING_SESSIONS],
        }));
        mutate(makeBookmarksUrl(mushafId), (data) => ({
          ...data,
          ...requestPayload[SyncDataType.BOOKMARKS],
        }));
        mutate(makeUserProfileUrl(), (data: UserProfile) => ({ ...data, isLocalDataSynced: true }));
      })
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => {});
  }
};
export default useSyncUserData;

import { SyncPinnedItemPayload } from 'types/PinnedItem';

enum SyncDataType {
  BOOKMARKS = 'bookmarks',
  READING_SESSIONS = 'readingSessions',
  PINNED_VERSES = 'pinnedVerses',
}

export interface SyncBookmarkPayload {
  key: number;
  type: string;
  verseNumber?: number;
  createdAt: string;
  mushaf: number;
  isReading?: boolean;
}

export interface SyncReadingSessionPayload {
  updatedAt: string;
  chapterNumber: number;
  verseNumber: number;
}

export interface SyncLocalDataPayload {
  [SyncDataType.BOOKMARKS]: SyncBookmarkPayload[];
  [SyncDataType.READING_SESSIONS]: SyncReadingSessionPayload[];
  [SyncDataType.PINNED_VERSES]?: SyncPinnedItemPayload[];
}

export default SyncDataType;

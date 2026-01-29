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
}

export interface SyncReadingSessionPayload {
  updatedAt: string;
  chapterNumber: number;
  verseNumber: number;
}

export interface SyncPinnedVersePayload {
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

export interface SyncLocalDataPayload {
  [SyncDataType.BOOKMARKS]: SyncBookmarkPayload[];
  [SyncDataType.READING_SESSIONS]: SyncReadingSessionPayload[];
  [SyncDataType.PINNED_VERSES]?: SyncPinnedVersePayload[];
}

export default SyncDataType;

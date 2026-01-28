enum SyncDataType {
  BOOKMARKS = 'bookmarks',
  READING_SESSIONS = 'readingSessions',
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
}

export default SyncDataType;

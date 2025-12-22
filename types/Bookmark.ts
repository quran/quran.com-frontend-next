import BookmarkType from './BookmarkType';

interface Bookmark {
  id: string;
  key: number;
  type: BookmarkType;
  verseNumber?: number;
  /**
   * Indicates whether this bookmark belongs to the default collection.
   * Undefined when collection membership hasn't been determined yet.
   */
  isInDefaultCollection?: boolean;
}

export default Bookmark;

export enum ReadingBookmarkType {
  AYAH = 'ayah',
  PAGE = 'page',
}

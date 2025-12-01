import BookmarkType from './BookmarkType';

interface Bookmark {
  id: string;
  key: number;
  type: BookmarkType;
  verseNumber?: number;
}

export default Bookmark;

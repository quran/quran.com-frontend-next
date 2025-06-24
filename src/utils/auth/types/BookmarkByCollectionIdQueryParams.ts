import BookmarkType from '@/types/BookmarkType';

type BookmarkByCollectionIdQueryParams = {
  cursor?: string;
  limit?: number;
  sortBy?: string;
  type?: BookmarkType;
};

export default BookmarkByCollectionIdQueryParams;

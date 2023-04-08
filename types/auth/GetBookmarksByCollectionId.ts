import Bookmark from 'types/Bookmark';
import { Collection } from 'types/Collection';

export interface GetBookmarkCollectionsIdResponse {
  data: Data;
  pagination: Pagination;
}

export interface Data {
  collection: Collection;
  bookmarks: Bookmark[];
  isOwner: boolean;
}

export interface Pagination {
  startCursor?: string;
  endCursor?: string;
  hasNextPage: boolean;
}

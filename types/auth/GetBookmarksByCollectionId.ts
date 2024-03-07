import Pagination from 'types/auth/Pagination';
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

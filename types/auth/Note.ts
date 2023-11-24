import { Pagination } from './GetBookmarksByCollectionId';

export type Note = {
  id: string;
  title: string;
  body: string;
  ranges: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type GetAllNotesResponse = {
  data: Note[];
  pagination: Pagination;
};

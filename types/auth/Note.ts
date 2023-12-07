import { Pagination } from './GetBookmarksByCollectionId';

export type Note = {
  id: string;
  title: string;
  body: string;
  ranges?: string[]; // will be undefined when the note is not attached to any verse
  createdAt: Date;
  updatedAt: Date;
  saveToQR?: boolean;
};

export type GetAllNotesResponse = {
  data: Note[];
  pagination: Pagination;
};

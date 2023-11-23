import { BaseResponse } from '../ApiResponses';

import { Pagination } from './GetBookmarksByCollectionId';

export type NoteResponse = {
  id: string;
  title: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
};

type NotesByTypeAndTypeIdResponse = BaseResponse & NoteResponse[];

export type GetAllNotesResponse = {
  data: NoteResponse[];
  pagination: Pagination;
};

export default NotesByTypeAndTypeIdResponse;

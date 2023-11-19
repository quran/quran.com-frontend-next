import { BaseResponse } from '../ApiResponses';

export type NoteResponse = {
  id: string;
  title: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
};

type NotesByTypeAndTypeIdResponse = BaseResponse & NoteResponse[];

export default NotesByTypeAndTypeIdResponse;

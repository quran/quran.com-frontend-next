import Pagination from './Pagination';

export enum AttachedEntityType {
  REFLECTION = 'reflection',
}

export type AttachedEntity = {
  createdAt: Date;
  updatedAt: Date;
  id: string;
  type: AttachedEntityType;
};

export type Note = {
  id: string;
  title: string;
  body: string;
  ranges?: string[]; // will be undefined when the note is not attached to any verse
  createdAt: Date;
  updatedAt: Date;
  saveToQR?: boolean;
  attachedEntities?: AttachedEntity[];
};

export type GetAllNotesResponse = {
  data: Note[];
  pagination: Pagination;
};

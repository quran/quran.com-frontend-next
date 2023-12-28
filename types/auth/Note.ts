import { Pagination } from './GetBookmarksByCollectionId';

import NoteVisibility from '@/utils/auth/types/Notes/NoteVisibility';

export type NoteReference = {
  surahId: number;
  fromAyah: number | null;
  toAyah: number | null;
  isSurah?: boolean;
};

export type Note = {
  id: string;
  title: string;
  body: string;
  ranges?: string[]; // will be undefined when the note is not attached to any verse
  references?: NoteReference[]; // will be undefined when the note is not attached to any verse
  createdAt: Date;
  updatedAt: Date;
  isPublic?: boolean;
  visibility?: NoteVisibility;
};

export type GetAllNotesResponse = {
  data: Note[];
  pagination: Pagination;
};

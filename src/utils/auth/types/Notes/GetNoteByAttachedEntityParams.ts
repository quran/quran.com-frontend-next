import NoteType from '@/types/NoteType';

type GetNoteByAttachedEntityParams = {
  entityId: string;
  entityType: NoteType;
};

export default GetNoteByAttachedEntityParams;

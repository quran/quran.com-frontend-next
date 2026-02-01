import { AttachedEntityType, Note } from '@/types/auth/Note';

export const addReflectionEntityToNote = (note: Note, postId: string): Note => {
  return {
    ...note,
    attachedEntities: [
      ...(note.attachedEntities || []),
      {
        type: AttachedEntityType.REFLECTION,
        id: postId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  };
};

export const mergeNote = (note: Note, noteFromResponse: Note): Note => {
  return {
    ...note,
    ...noteFromResponse,
  };
};

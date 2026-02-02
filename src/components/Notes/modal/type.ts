import { AttachedEntity, Note } from '@/types/auth/Note';

export type NoteWithRecentReflection = Note & {
  postUrl?: string;
  recentReflection?: AttachedEntity;
};

import { useMemo } from 'react';

import { NoteWithRecentReflection } from '@/components/Notes/modal/type';
import { AttachedEntityType, Note } from '@/types/auth/Note';
import { getQuranReflectPostUrl } from '@/utils/quranReflect/navigation';

const useNotesWithRecentReflection = (data: Note[]): NoteWithRecentReflection[] => {
  return useMemo(() => {
    const notesArray = Array.isArray(data) ? data : [];

    return notesArray.map((note) => {
      const attachedEntities = note.attachedEntities || [];
      const attachedEntity = attachedEntities
        .slice()
        .reverse()
        .find((entity) => entity.type === AttachedEntityType.REFLECTION);

      const postUrl = attachedEntity ? getQuranReflectPostUrl(attachedEntity.id) : undefined;
      return { ...note, postUrl, recentReflection: attachedEntity };
    });
  }, [data]);
};

export default useNotesWithRecentReflection;

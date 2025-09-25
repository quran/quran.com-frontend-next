import { Note } from '@/types/auth/Note';
import { makeGetNoteByIdUrl, makeGetNotesByVerseUrl } from '@/utils/auth/apiPaths';

/**
 * Mutate SWR cache entries related to Notes in a DRY way.
 * - If `updated` is an array, it will replace the list for verseKey as-is.
 * - If `updated` is a single Note, it will upsert into the list for verseKey.
 * - If `noteId` is provided and `updated` is a Note, it updates the single-note cache as well.
 * Never revalidates.
 */
export const mutateNotesCache = (
  mutate: (key: any, data?: any, shouldRevalidate?: boolean | any) => any,
  params: {
    verseKey?: string;
    noteId?: string;
    updated: Note | Note[];
  },
) => {
  const { verseKey, noteId, updated } = params;

  if (verseKey) {
    const listKey = makeGetNotesByVerseUrl(verseKey);
    if (Array.isArray(updated)) {
      // Replace list
      mutate(listKey, updated, false);
    } else {
      const noteObj = updated as Note;
      mutate(
        listKey,
        (prev: any) => {
          const list: Note[] = Array.isArray(prev) ? (prev as Note[]) : [];
          const idx = list.findIndex((n) => n.id === noteObj.id);
          if (idx === -1) return [noteObj, ...list];
          const copy = [...list];
          copy[idx] = noteObj;
          return copy;
        },
        false,
      );
    }
  }

  if (noteId && !Array.isArray(updated)) {
    mutate(makeGetNoteByIdUrl(noteId), updated as Note, false);
  }
};

export default mutateNotesCache;

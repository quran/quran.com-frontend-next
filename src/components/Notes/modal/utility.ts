import { ScopedMutator, Cache } from 'swr/dist/types';

import { Note } from '@/types/auth/Note';
import { makeGetNoteByIdUrl, makeGetNotesByVerseUrl, makeNotesUrl } from '@/utils/auth/apiPaths';
import { isVerseKeyWithinRanges } from '@/utils/verse';

export const isNotePublishFailed = (data: unknown) => {
  return data instanceof Object && 'error' in data && data.error === true;
};

export const getNoteFromResponse = (data: unknown): Note | undefined => {
  const note = data as Note & { note?: Note };
  if (isNotePublishFailed(note)) return note.note;
  return note;
};

export const invalidateCache = ({
  mutate,
  cache,
  verseKeys,
  note,
  invalidateCount = false,
}: {
  mutate: ScopedMutator<unknown>;
  cache?: Cache<unknown>;
  verseKeys?: string[];
  note?: Note;
  invalidateCount?: boolean;
}) => {
  const cacheKeys = (cache as unknown as { keys: () => string[] })?.keys();
  const uniqueVerseKeys = verseKeys ? Array.from(new Set(verseKeys)) : [];

  if (invalidateCount) {
    if (cacheKeys) {
      const keys = [...cacheKeys].filter((key) => {
        if (!key.startsWith('countNotes/')) {
          return false;
        }

        if (uniqueVerseKeys.length > 0) {
          const rangeString = key.replace('countNotes/', '');
          return uniqueVerseKeys.some((verseKey) => isVerseKeyWithinRanges(verseKey, rangeString));
        }

        return true;
      });

      keys.forEach((key) => mutate(key, undefined, { revalidate: true }));
    } else {
      const countKeys = uniqueVerseKeys.map((key) => `countNotes/${key}-${key}`);
      countKeys.forEach((key) => mutate(key, undefined, { revalidate: true }));
    }
  }

  if (uniqueVerseKeys.length > 0) {
    const updatedKeys = uniqueVerseKeys.map((key) => makeGetNotesByVerseUrl(key));
    updatedKeys.forEach((key) => mutate(key, undefined, { revalidate: true }));
  }

  if (note) mutate(makeGetNoteByIdUrl(note.id), undefined, { revalidate: true });
  mutate(makeNotesUrl(), undefined, { revalidate: true });
};

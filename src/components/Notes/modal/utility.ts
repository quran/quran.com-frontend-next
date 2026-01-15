import { ScopedMutator, Cache } from 'swr/dist/types';

import { Note } from '@/types/auth/Note';
import { makeGetNoteByIdUrl, makeGetNotesByVerseUrl, makeNotesUrl } from '@/utils/auth/apiPaths';
import { makeGetUserReflectionsUrl } from '@/utils/quranReflect/apiPaths';
import { isVerseKeyWithinRanges } from '@/utils/verse';

/**
 * Checks if the API response indicates a note publish failure.
 *
 * A failed publish response is identified by `{ error: true }`
 * @param {unknown} data - Raw API response
 * @returns {boolean} - Boolean indicating if the note publish failed
 */
export const isNotePublishFailed = (data: unknown): boolean => {
  return (
    data !== null &&
    typeof data === 'object' &&
    'error' in data &&
    (data as { error?: unknown }).error === true
  );
};

/**
 * Safely extracts a `Note` from an API response.
 *
 * This helper normalizes different backend response shapes:
 *
 * - **Successful save & publish** → the response *is* the `Note`
 * - **Saved but failed to publish** → the `Note` is nested under `data.note`
 * - **Invalid or unexpected response** → returns `undefined`
 *
 * @param {unknown} data - Raw API response
 * @returns {Note | undefined} The extracted `Note` if present, otherwise `undefined`
 */
export const getNoteFromResponse = (data: unknown): Note | undefined => {
  if (typeof data !== 'object' || data === null) return undefined;
  if (isNotePublishFailed(data)) return (data as { note?: Note }).note;
  return data as Note;
};

/**
 * Invalidates SWR cache entries related to notes after mutations.
 * When invalidateCount is true, this function invalidates:
 * - All countNotes/* keys that overlap with the provided verseKeys (when cache is available)
 * - Single-verse count keys for each verseKey (when cache is not available)
 *
 * Always invalidates:
 * - Note-by-verse keys for all provided verseKeys
 * - The specific note by ID (if provided)
 * - The general notes list
 *
 */
export const invalidateCache = ({
  mutate,
  cache,
  verseKeys,
  note,
  invalidateCount = false,
  invalidateReflections = false,
}: {
  mutate: ScopedMutator<unknown>;
  cache?: Cache<unknown>;
  verseKeys?: string[];
  note?: Note;
  invalidateCount?: boolean;
  invalidateReflections?: boolean;
}): void => {
  const uniqueVerseKeys = verseKeys ? Array.from(new Set(verseKeys)) : [];

  if (invalidateCount) {
    invalidateCountCaches(mutate, cache, uniqueVerseKeys);
  }

  invalidateVerseCaches(mutate, uniqueVerseKeys);
  invalidateNoteCaches(mutate, note);
  if (invalidateReflections) invalidateReflectionsCaches(mutate, cache);
};

/**
 * Invalidates note count caches for the given verse keys.
 * When cache is available, invalidates all overlapping count caches.
 * When cache is not available, invalidates exact single-verse count caches.
 */
const invalidateCountCaches = (
  mutate: ScopedMutator<unknown>,
  cache: Cache<unknown> | undefined,
  verseKeys: string[],
): void => {
  const cacheKeys = (cache as unknown as { keys: () => string[] })?.keys();

  if (cacheKeys) {
    const keys = [...cacheKeys].filter((key) => {
      if (!key.startsWith('countNotes/')) return false;

      if (verseKeys.length > 0) {
        const rangeString = key.replace('countNotes/', '');
        return verseKeys.some((verseKey) => isVerseKeyWithinRanges(verseKey, rangeString));
      }

      // When verseKeys is empty, invalidate all countNotes/* keys (invalidate all counts scenario)
      return true;
    });

    keys.forEach((key) => mutate(key, undefined, { revalidate: true }));
  } else {
    const countKeys = verseKeys.map((key) => `countNotes/${key}-${key}`);
    countKeys.forEach((key) => mutate(key, undefined, { revalidate: true }));
  }
};

/**
 * Invalidates note-by-verse caches for the given verse keys.
 */
const invalidateVerseCaches = (mutate: ScopedMutator<unknown>, verseKeys: string[]): void => {
  if (verseKeys.length > 0) {
    const updatedKeys = verseKeys.map((key) => makeGetNotesByVerseUrl(key));
    updatedKeys.forEach((key) => mutate(key, undefined, { revalidate: true }));
  }
};

/**
 * Invalidates individual note and general notes list caches.
 */
const invalidateNoteCaches = (mutate: ScopedMutator<unknown>, note: Note | undefined): void => {
  mutate(makeNotesUrl(), undefined, { revalidate: true });
  if (note) mutate(makeGetNoteByIdUrl(note.id), undefined, { revalidate: true });
};

/**
 * Invalidates reflections caches for the given verse keys.
 */
const invalidateReflectionsCaches = (
  mutate: ScopedMutator<unknown>,
  cache?: Cache<unknown>,
): void => {
  const cacheKeys = (cache as unknown as { keys: () => string[] })?.keys();

  if (cacheKeys) {
    const urlKey = makeGetUserReflectionsUrl({ page: 1, limit: 10 }).split('?')[0];
    const keys = [...cacheKeys].filter((key) => key.startsWith(urlKey));
    keys.forEach((key) => mutate(key, undefined, { revalidate: true }));
  }
};

import { ScopedMutator, Cache } from 'swr/dist/types';

import { GetAllNotesResponse, Note } from '@/types/auth/Note';
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
 * Enum representing the type of cache mutation action.
 */
export enum CacheAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

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
  action,
}: {
  mutate: ScopedMutator<unknown>;
  cache?: Cache<unknown>;
  verseKeys?: string[];
  note?: Note;
  invalidateCount?: boolean;
  invalidateReflections?: boolean;
  action?: CacheAction;
}): void => {
  const uniqueVerseKeys = verseKeys ? Array.from(new Set(verseKeys)) : [];

  if (invalidateCount) invalidateCountCaches(mutate, cache, uniqueVerseKeys);
  if (invalidateReflections) invalidateReflectionsCaches(mutate, cache);

  updateVerseCaches(mutate, uniqueVerseKeys, note, action);
  updateNoteCaches(mutate, cache, note, action);
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
      if (!key.includes('countNotes/')) return false;

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
 * Updates note-by-verse caches for the given verse keys.
 */
const updateVerseCaches = (
  mutate: ScopedMutator<unknown>,
  verseKeys: string[],
  note?: Note,
  action?: CacheAction,
): void => {
  if (verseKeys.length === 0) return;

  const updatedKeys = verseKeys.map((key) => makeGetNotesByVerseUrl(key));

  updatedKeys.forEach((key) => {
    mutate(
      key,
      (data: Note[] | undefined) => {
        if (!data || !note || !action) return data;

        if (action === CacheAction.CREATE) return [note, ...data];
        if (action === CacheAction.UPDATE) return data.map((n) => (n.id === note.id ? note : n));
        if (action === CacheAction.DELETE) return data.filter((n) => n.id !== note.id);

        return undefined;
      },
      { revalidate: true },
    );
  });
};

/**
 * Updates individual note and general notes list caches.
 */
const updateNoteCaches = (
  mutate: ScopedMutator<unknown>,
  cache: Cache<unknown> | undefined,
  note: Note | undefined,
  action?: CacheAction,
) => {
  // Update single note cache
  if (note && action === CacheAction.UPDATE) {
    mutate(makeGetNoteByIdUrl(note.id), note, { revalidate: true });
  } else if (note || action === CacheAction.DELETE) {
    mutate(makeGetNoteByIdUrl(note.id), undefined, { revalidate: true });
  }

  const baseNotesUrl = makeNotesUrl().split('?')[0];

  // Update general notes list (My Notes tab)
  const cacheKeys = (cache as unknown as { keys: () => string[] })?.keys();
  if (!cacheKeys) mutate(baseNotesUrl, undefined, { revalidate: true });

  const notesListKeys = [...cacheKeys].filter(
    (key) => key.startsWith('$inf$') && key.includes(baseNotesUrl),
  );

  notesListKeys.forEach((key) =>
    mutate(
      key,
      (data: GetAllNotesResponse[] | undefined) => updatePaginatedNotes(data, note, action),
      { revalidate: false },
    ),
  );
};

const updatePaginatedNotes = (
  data: GetAllNotesResponse[] | undefined,
  note?: Note,
  action?: CacheAction,
) => {
  if (!data || !note || !action) return undefined;

  if (Array.isArray(data)) {
    if (action === CacheAction.CREATE) {
      const firstPage = data[0];
      if (!firstPage) return data;
      return [{ ...firstPage, data: [note, ...firstPage.data] }, ...data.slice(1)];
    }

    return data.map((page) => {
      if (action === CacheAction.UPDATE) {
        return { ...page, data: page.data.map((n) => (n.id === note.id ? note : n)) };
      }

      if (action === CacheAction.DELETE) {
        return { ...page, data: page.data.filter((n) => n.id !== note.id) };
      }

      return page;
    });
  }

  // Fallback for non-array data structure if any (shouldn't happen with useSWRInfinite)
  return undefined;
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
    const keys = [...cacheKeys].filter((key) => key.startsWith('$inf$') && key.includes(urlKey));
    keys.forEach((key) => mutate(key, undefined, { revalidate: true }));
  }
};

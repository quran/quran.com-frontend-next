import { Note } from '@/types/auth/Note';

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

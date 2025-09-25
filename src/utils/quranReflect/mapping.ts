import { Note, AttachedEntityType, AttachedEntity } from '@/types/auth/Note';
import AyahReflection from '@/types/QuranReflect/AyahReflection';
import { ReflectionReference } from '@/types/QuranReflect/AyahReflectionsResponse';

/**
 * Convert ranges array to ReflectionReference format for QuranReflect API
 *
 * @param {string[]} ranges - Array of range strings
 * @returns {ReflectionReference[]} Array of reflection references
 */
export const rangesToReflectionReferences = (ranges: string[]): ReflectionReference[] => {
  return ranges
    .map((range) => {
      // Handle range format like "1:1-1:5" or single verse like "1:1"
      const match = range.match(/(\d+):(\d+)(?:-\d+:(\d+))?/);
      if (!match) return null;

      const chapterId = Number(match[1]);
      const from = Number(match[2]);
      const to = match[3] ? Number(match[3]) : from;

      return {
        chapterId,
        from,
        to,
      };
    })
    .filter(Boolean) as ReflectionReference[];
};

/**
 * Convert verseKey format to ReflectionReference
 *
 * @param {string} verseKey - Verse key in format "chapterId:verseNumber"
 * @returns {ReflectionReference} Reflection reference object
 */
export const verseKeyToReflectionReference = (verseKey: string): ReflectionReference => {
  const [chapterIdStr, verseNumberStr] = verseKey.split(':');
  return {
    chapterId: Number(chapterIdStr),
    from: Number(verseNumberStr),
    to: Number(verseNumberStr),
  };
};

/**
 * Map AyahReflection to Note shape for UI compatibility
 *
 * @param {AyahReflection} reflection - The reflection to map
 * @returns {Note} Note object for UI consumption
 */
export const mapReflectionToNote = (reflection: AyahReflection): Note => {
  // Extract verse information from references
  const verseKey = reflection.references?.[0]
    ? `${reflection.references[0].chapterId}:${reflection.references[0].from}`
    : undefined;

  // Convert references back to ranges format
  const ranges = reflection.references?.map((ref) =>
    ref.from === ref.to
      ? `${ref.chapterId}:${ref.from}-${ref.chapterId}:${ref.to}`
      : `${ref.chapterId}:${ref.from}-${ref.chapterId}:${ref.to}`,
  );

  const attachedEntity: AttachedEntity = {
    type: AttachedEntityType.REFLECTION,
    id: String(reflection.id),
    createdAt: new Date(reflection.createdAt),
    updatedAt: new Date(reflection.updatedAt),
  };

  return {
    id: String(reflection.id),
    title: '', // Reflections don't have titles
    body: reflection.body || '',
    verseKey,
    ranges,
    createdAt: new Date(reflection.createdAt),
    updatedAt: new Date(reflection.updatedAt),
    attachedEntities: [attachedEntity],
    // Mark as already published since this is from QR
    saveToQR: true,
  };
};

const isReflectionEntity = (entity: AttachedEntity) =>
  entity.type === AttachedEntityType.REFLECTION;

/**
 * Check if a note is a reflection based on its attached entities
 *
 * @param {Note} note - The note to check
 * @returns {boolean} True if the note is a reflection
 */
export const isReflectionNote = (note: Note): boolean => {
  return note.attachedEntities?.some(isReflectionEntity);
};

/**
 * Get the reflection post ID from a note's attached entities
 *
 * @param {Note} note - The note to extract post ID from
 * @returns {string | null} The reflection post ID or null if not found
 */
export const getReflectionPostId = (note: Note): string | null => {
  const reflectionEntity = note.attachedEntities?.find(isReflectionEntity);
  return reflectionEntity?.id || null;
};

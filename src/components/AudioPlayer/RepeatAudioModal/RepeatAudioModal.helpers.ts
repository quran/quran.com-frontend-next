/* eslint-disable max-lines */
import {
  JsonNumberString,
  RepeatSettingsPreference,
  isJsonNumberString,
} from '@/redux/types/AudioState';
import { getChapterNumberFromKey, getVerseNumberFromKey, makeVerseKey } from '@/utils/verse';

export interface VerseRepetitionState {
  repeatRange: number;
  repeatEachVerse: number;
  from: string;
  to: string;
  delayMultiplier: number;
}

interface VerseRepetitionDefaultsInput {
  chapterNumber: number;
  firstVerseKeyInChapter: string;
  lastVerseKeyInChapter: string;
  selectedVerseKey?: string;
  audioSurah?: number;
  fromVerseNumberFromActor?: number;
  toVerseNumberFromActor?: number;
  persistedFromVerseKey?: string;
  persistedToVerseKey?: string;
  repeatRangeFromActor?: number;
  repeatEachVerseFromActor?: number;
  delayMultiplierFromActor?: number | string | null;
  persistedRepeatRange?: number | JsonNumberString | null;
  persistedRepeatEachVerse?: number | JsonNumberString | null;
  persistedDelayMultiplier?: number | JsonNumberString | null;
}

interface VerseKeyCalculationInput {
  chapterNumber: number;
  firstVerseKeyInChapter: string;
  lastVerseKeyInChapter: string;
  selectedVerseKey?: string;
  audioSurah?: number;
  fromVerseNumberFromActor?: number;
  toVerseNumberFromActor?: number;
  persistedFromVerseKey?: string;
  persistedToVerseKey?: string;
}

interface RepeatCycleInput {
  repeatRangeFromActor?: number;
  repeatEachVerseFromActor?: number;
  delayMultiplierFromActor?: number | string | null;
  persistedRepeatRange?: number | JsonNumberString | null;
  persistedRepeatEachVerse?: number | JsonNumberString | null;
  persistedDelayMultiplier?: number | JsonNumberString | null;
}

type RepeatSettingsLike = {
  repeatRange?: number | JsonNumberString | null;
  repeatEachVerse?: number | JsonNumberString | null;
  delayMultiplier?: number | JsonNumberString | null;
  from?: string;
  to?: string;
};

/**
 * Magic number used to represent "infinity" for repeat settings in the backend API.
 * The backend expects -1 to mean "repeat indefinitely" (e.g., repeatRange, repeatEachVerse).
 * Keep this in sync with backend expectations.
 */
export const INFINITY_VALUE = -1;

/**
 * Safely parse repeat counter values coming from persisted storage.
 *
 * @returns {number} The normalized repeat value, or the provided fallback if parsing fails.
 */
export const normalizeRepeatValue = (
  value: number | string | null | undefined,
  fallback: number,
): number => {
  if (value === null || value === undefined) return fallback;
  if (value === Infinity || value === -1) return Infinity;
  if (typeof value === 'string') {
    if (!isJsonNumberString(value)) return fallback;
    return Number(value);
  }
  return value;
};

/**
 * Check whether a verse key belongs to a specific chapter.
 *
 * @returns {boolean} True if the verse key is in the chapter, false otherwise.
 */
const isVerseKeyInChapter = (verseKey: string | undefined, chapterNumber: number) => {
  if (!verseKey) return false;
  return getChapterNumberFromKey(verseKey) === chapterNumber;
};

/**
 * Build a verse key for the repeat actor entries if a verse number exists.
 *
 * @returns {string | undefined} The constructed verse key, or undefined if no verse number is provided.
 */
const getActorVerseKey = (
  verseNumber: number | undefined,
  surahNumber: number,
): string | undefined => {
  if (verseNumber === undefined) return undefined;
  return makeVerseKey(surahNumber, verseNumber);
};

interface VerseKeySelectionInput {
  selectedVerseKey?: string;
  actorVerseKey?: string;
  persistedVerseKey?: string;
  fallbackVerseKey: string;
  chapterNumber: number;
}

/**
 * Pick the best verse key from the available sources based on priority.
 *
 * @returns {string} The selected verse key to use.
 */
const pickVerseKey = ({
  selectedVerseKey,
  actorVerseKey,
  persistedVerseKey,
  fallbackVerseKey,
  chapterNumber,
}: VerseKeySelectionInput): string => {
  if (selectedVerseKey && isVerseKeyInChapter(selectedVerseKey, chapterNumber)) {
    return selectedVerseKey;
  }
  if (isVerseKeyInChapter(actorVerseKey, chapterNumber)) return actorVerseKey as string;
  if (isVerseKeyInChapter(persistedVerseKey, chapterNumber)) return persistedVerseKey as string;
  return fallbackVerseKey;
};

/**
 * Ensure the start verse is always before the end verse. Swap when needed.
 *
 * @returns {{ from: string; to: string }} Normalized from/to verse keys.
 */
export const normalizeVerseRange = (fromKey: string, toKey: string) => {
  if (!fromKey || !toKey) {
    return { from: fromKey, to: toKey };
  }
  const fromVerseNumber = getVerseNumberFromKey(fromKey);
  const toVerseNumber = getVerseNumberFromKey(toKey);
  if (
    Number.isNaN(fromVerseNumber) ||
    Number.isNaN(toVerseNumber) ||
    fromVerseNumber <= toVerseNumber
  ) {
    return { from: fromKey, to: toKey };
  }
  return { from: toKey, to: fromKey };
};

/**
 * Determine the effective `from` and `to` verse keys to display in the modal.
 *
 * @returns {{ from: string; to: string }} Effective from/to verse keys.
 */
const getRepeatKeys = ({
  chapterNumber,
  firstVerseKeyInChapter,
  lastVerseKeyInChapter,
  selectedVerseKey,
  audioSurah,
  fromVerseNumberFromActor,
  toVerseNumberFromActor,
  persistedFromVerseKey,
  persistedToVerseKey,
}: VerseKeyCalculationInput) => {
  const fallbackFromKey =
    selectedVerseKey || firstVerseKeyInChapter || makeVerseKey(chapterNumber, 1);
  const fallbackToKey = selectedVerseKey || lastVerseKeyInChapter || makeVerseKey(chapterNumber, 1);
  const repeatSurahNumber = audioSurah ?? chapterNumber;
  const actorFromKey = getActorVerseKey(fromVerseNumberFromActor, repeatSurahNumber);
  const actorToKey = getActorVerseKey(toVerseNumberFromActor, repeatSurahNumber);

  const selectedFromKey = pickVerseKey({
    selectedVerseKey,
    actorVerseKey: actorFromKey,
    persistedVerseKey: persistedFromVerseKey,
    fallbackVerseKey: fallbackFromKey,
    chapterNumber,
  });
  const selectedToKey = pickVerseKey({
    selectedVerseKey,
    actorVerseKey: actorToKey,
    persistedVerseKey: persistedToVerseKey,
    fallbackVerseKey: fallbackToKey,
    chapterNumber,
  });
  return normalizeVerseRange(selectedFromKey, selectedToKey);
};

/**
 * Build the repeat cycles while honoring priority: actor -> persisted -> defaults.
 *
 * @returns {{ repeatRange: number; repeatEachVerse: number; delayMultiplier: number }} Normalized cycles.
 */
const getRepeatCycles = ({
  repeatRangeFromActor,
  repeatEachVerseFromActor,
  delayMultiplierFromActor,
  persistedRepeatRange,
  persistedRepeatEachVerse,
  persistedDelayMultiplier,
}: RepeatCycleInput) => {
  const fallbackRepeatRange = normalizeRepeatValue(persistedRepeatRange, 2);
  const fallbackRepeatEachVerse = normalizeRepeatValue(persistedRepeatEachVerse, 2);
  const fallbackDelayMultiplier = normalizeRepeatValue(persistedDelayMultiplier, 1);

  return {
    repeatRange: normalizeRepeatValue(repeatRangeFromActor, fallbackRepeatRange),
    repeatEachVerse: normalizeRepeatValue(repeatEachVerseFromActor, fallbackRepeatEachVerse),
    delayMultiplier: normalizeRepeatValue(delayMultiplierFromActor, fallbackDelayMultiplier),
  };
};

/**
 * Converts repeat numeric values into a form safe for persistence/API calls.
 *
 * @returns {number | null | undefined} Normalized numeric value or sentinel/null/undefined.
 */
const toRepeatNumericValue = (
  value: number | JsonNumberString | null | undefined,
): number | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (value === INFINITY_VALUE || value === Infinity) return INFINITY_VALUE;
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : INFINITY_VALUE;
  }
  if (typeof value === 'string') {
    if (!isJsonNumberString(value)) return null;
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return null;
    return Number.isFinite(parsed) ? parsed : INFINITY_VALUE;
  }
  return null;
};

/**
 * Serialize repeat settings values into a consistent preference shape.
 *
 * @returns {RepeatSettingsPreference} Serialized repeat settings ready for storage.
 */
export const serializeRepeatSettings = (settings: RepeatSettingsLike): RepeatSettingsPreference => {
  const repeatRange = toRepeatNumericValue(settings.repeatRange);
  const repeatEachVerse = toRepeatNumericValue(settings.repeatEachVerse);
  const delayMultiplier = toRepeatNumericValue(settings.delayMultiplier);

  return {
    from: settings.from,
    to: settings.to,
    ...(repeatRange !== undefined && { repeatRange }),
    ...(repeatEachVerse !== undefined && { repeatEachVerse }),
    ...(delayMultiplier !== undefined && { delayMultiplier }),
  };
};

/**
 * Serialize repeat settings if present, otherwise return undefined.
 *
 * @returns {RepeatSettingsPreference | undefined} Serialized settings or undefined.
 */
export const serializeOptionalRepeatSettings = (
  settings?: RepeatSettingsLike,
): RepeatSettingsPreference | undefined =>
  settings ? serializeRepeatSettings(settings) : undefined;

/**
 * Prepare repeat settings for API consumption by normalizing numeric fields.
 *
 * @returns {RepeatSettingsPreference} Normalized settings aligned with API expectations.
 */
export const prepareRepeatSettingsForApi = (
  settings: RepeatSettingsPreference,
): RepeatSettingsPreference => {
  const repeatRange = toRepeatNumericValue(settings.repeatRange);
  const repeatEachVerse = toRepeatNumericValue(settings.repeatEachVerse);
  const delayMultiplier = toRepeatNumericValue(settings.delayMultiplier);

  return {
    from: settings.from,
    to: settings.to,
    ...(repeatRange !== undefined && { repeatRange }),
    ...(repeatEachVerse !== undefined && { repeatEachVerse }),
    ...(delayMultiplier !== undefined && { delayMultiplier }),
  };
};

/**
 * Build the initial modal state using the available sources (selection, actor, and persisted preferences).
 *
 * @returns {VerseRepetitionState} The default verse repetition state for the modal.
 */
export function buildDefaultVerseRepetition({
  chapterNumber,
  firstVerseKeyInChapter,
  lastVerseKeyInChapter,
  selectedVerseKey,
  audioSurah,
  fromVerseNumberFromActor,
  toVerseNumberFromActor,
  persistedFromVerseKey,
  persistedToVerseKey,
  repeatRangeFromActor,
  repeatEachVerseFromActor,
  delayMultiplierFromActor,
  persistedRepeatRange,
  persistedRepeatEachVerse,
  persistedDelayMultiplier,
}: VerseRepetitionDefaultsInput): VerseRepetitionState {
  const { from, to } = getRepeatKeys({
    chapterNumber,
    firstVerseKeyInChapter,
    lastVerseKeyInChapter,
    selectedVerseKey,
    audioSurah,
    fromVerseNumberFromActor,
    toVerseNumberFromActor,
    persistedFromVerseKey,
    persistedToVerseKey,
  });
  const { repeatRange, repeatEachVerse, delayMultiplier } = getRepeatCycles({
    repeatRangeFromActor,
    repeatEachVerseFromActor,
    delayMultiplierFromActor,
    persistedRepeatRange,
    persistedRepeatEachVerse,
    persistedDelayMultiplier,
  });

  return {
    repeatRange,
    repeatEachVerse,
    from,
    to,
    delayMultiplier,
  };
}

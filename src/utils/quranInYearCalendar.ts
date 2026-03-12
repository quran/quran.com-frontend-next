import { getVerseAndChapterNumbersFromKey } from './verse';

import ayahOfTheDayData from '@/data/ayah_of_the_day.json';

interface AyahOfTheDayEntry {
  date: string;
  verseKey: string;
}

interface ParsedAyahOfTheDayEntry extends AyahOfTheDayEntry {
  timestamp: number;
}

const parseDate = (date: string): number => {
  const [day, month, year] = date.split('/').map(Number);
  return Date.UTC(year, month - 1, day);
};

const findAyahEntryForDate = (
  sortedAyahEntries: ParsedAyahOfTheDayEntry[],
  targetTimestamp: number,
): ParsedAyahOfTheDayEntry | null => {
  let previousEntry: ParsedAyahOfTheDayEntry | null = null;

  for (let index = 0; index < sortedAyahEntries.length; index += 1) {
    const entry = sortedAyahEntries[index];

    if (entry.timestamp === targetTimestamp) return entry;
    if (entry.timestamp > targetTimestamp) return previousEntry || entry;

    previousEntry = entry;
  }

  return previousEntry;
};

/**
 * Creates a date lookup function backed by pre-sorted ayah data.
 *
 * @param {AyahOfTheDayEntry[]} ayahEntries
 * @returns {(targetTimestamp: number) => ParsedAyahOfTheDayEntry | null}
 */
const createGetAyahEntryForDate = (ayahEntries: AyahOfTheDayEntry[]) => {
  const lookupCache = new Map<number, ParsedAyahOfTheDayEntry | null>();

  const sortedAyahEntries: ParsedAyahOfTheDayEntry[] = ayahEntries
    .map((entry) => ({ ...entry, timestamp: parseDate(entry.date) }))
    .sort((entryA, entryB) => entryA.timestamp - entryB.timestamp);

  /**
   * Returns the entry for the requested day, or the nearest earlier entry.
   * If there is no earlier entry, it falls back to the nearest later entry.
   * This also means dates outside the configured range clamp to the nearest
   * available ayah instead of returning null.
   *
   * @param {number} targetTimestamp
   * @returns {ParsedAyahOfTheDayEntry | null}
   */
  return (targetTimestamp: number): ParsedAyahOfTheDayEntry | null => {
    if (lookupCache.has(targetTimestamp)) return lookupCache.get(targetTimestamp);

    const entry = findAyahEntryForDate(sortedAyahEntries, targetTimestamp);
    lookupCache.set(targetTimestamp, entry);

    return entry;
  };
};

const getAyahEntryForDate = createGetAyahEntryForDate(ayahOfTheDayData as AyahOfTheDayEntry[]);

/**
 * Returns the ayah for today using UTC dates.
 * If today's date is missing, it falls back to the closest previous date,
 * or the closest next date when no previous date exists. Dates outside the
 * configured range also clamp to the nearest available ayah.
 *
 * @returns {{ chapter: number; verse: number } | null}
 */
const getCurrentDayAyah = (): { chapter: number; verse: number } | null => {
  const now = new Date();
  const todayTimestamp = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const entry = getAyahEntryForDate(todayTimestamp);

  if (!entry) return null;

  const [chapterStr, verseStr] = getVerseAndChapterNumbersFromKey(entry.verseKey);
  return { chapter: Number(chapterStr), verse: Number(verseStr) };
};

export default getCurrentDayAyah;

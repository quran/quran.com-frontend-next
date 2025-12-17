import { describe, expect, it } from 'vitest';

import ayahOfTheDayData from '@/data/ayah_of_the_day.json';

type AyahEntry = {
  date: string;
  verseKey: string;
};

// Sample rows copied from the Google Sheet (Ayah of the Day) to validate JSON integrity.
const SHEET_SAMPLES: AyahEntry[] = [
  { date: '25/03/2025', verseKey: '39:53' },
  { date: '28/03/2025', verseKey: '47:31' },
  { date: '01/04/2025', verseKey: '57:16' },
  { date: '05/04/2025', verseKey: '2:2' },
  { date: '14/05/2025', verseKey: '3:185' },
  { date: '23/07/2025', verseKey: '8:64' },
  { date: '11/10/2025', verseKey: '22:24' },
  { date: '28/11/2025', verseKey: '34:39' },
  { date: '19/01/2026', verseKey: '57:21' },
  { date: '19/02/2026', verseKey: '112:1' },
];

const parseDateToTimestamp = (date: string): number => {
  const [day, month, year] = date.split('/').map(Number);
  return Date.UTC(year, month - 1, day);
};

const isValidDateFormat = (date: string): boolean => /^\d{2}\/\d{2}\/\d{4}$/.test(date);

const isValidVerseKey = (verseKey: string): boolean => /^\d+:\d+$/.test(verseKey);

describe('ayah_of_the_day data', () => {
  it('has valid data structure for all entries', () => {
    expect(ayahOfTheDayData.length).toBeGreaterThan(0);

    ayahOfTheDayData.forEach((entry) => {
      // Validate required properties exist
      expect(entry).toHaveProperty('date');
      expect(entry).toHaveProperty('verseKey');

      // Validate types
      expect(typeof entry.date).toBe('string');
      expect(typeof entry.verseKey).toBe('string');

      // Validate no extra properties
      expect(Object.keys(entry)).toHaveLength(2);

      // Validate formats
      expect(isValidDateFormat(entry.date)).toBe(true);
      expect(isValidVerseKey(entry.verseKey)).toBe(true);

      // Validate non-empty
      expect(entry.date.trim()).not.toBe('');
      expect(entry.verseKey.trim()).not.toBe('');
    });
  });

  it('matches sampled rows from the sheet (date -> verseKey)', () => {
    const jsonMap = new Map(ayahOfTheDayData.map((entry) => [entry.date, entry.verseKey]));

    SHEET_SAMPLES.forEach(({ date, verseKey }) => {
      expect(jsonMap.get(date)).toBe(verseKey);
    });
  });

  it('is sorted by ascending date (DD/MM/YYYY)', () => {
    const timestamps = ayahOfTheDayData.map((entry) => parseDateToTimestamp(entry.date));
    const sorted = [...timestamps].sort((a, b) => a - b);
    expect(timestamps).toEqual(sorted);
  });
});

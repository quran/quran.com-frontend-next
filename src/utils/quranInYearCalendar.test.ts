/* eslint-disable react-func/max-lines-per-function */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type AyahEntry = {
  date: string;
  verseKey: string;
};

const loadGetCurrentDayAyah = async (ayahOfTheDayData: AyahEntry[]) => {
  vi.resetModules();
  vi.doMock('@/data/ayah_of_the_day.json', () => ({
    default: ayahOfTheDayData,
  }));

  const { default: getCurrentDayAyah } = await import('./quranInYearCalendar');
  return getCurrentDayAyah;
};

const multipleAyahEntries: AyahEntry[] = [
  { date: '24/03/2026', verseKey: '2:44' },
  { date: '20/03/2026', verseKey: '1:2' },
  { date: '22/03/2026', verseKey: '2:21' },
];

const spacedAyahEntries: AyahEntry[] = [
  { date: '01/01/2027', verseKey: '2:255' },
  { date: '20/01/2027', verseKey: '18:10' },
  { date: '28/01/2027', verseKey: '112:1' },
];

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.doUnmock('@/data/ayah_of_the_day.json');
  vi.resetModules();
});

describe('getCurrentDayAyah exact matches', () => {
  it('returns the first entry when the target date matches the first available date', async () => {
    const getCurrentDayAyah = await loadGetCurrentDayAyah(multipleAyahEntries);

    vi.setSystemTime(new Date('2026-03-20T00:00:00.000Z'));

    expect(getCurrentDayAyah()).toEqual({ chapter: 1, verse: 2 });
  });

  it('returns the exact ayah for an exact UTC date match', async () => {
    const getCurrentDayAyah = await loadGetCurrentDayAyah([
      { date: '22/03/2026', verseKey: '2:21' },
      { date: '20/03/2026', verseKey: '1:2' },
      { date: '21/03/2026', verseKey: '2:2' },
    ]);

    vi.setSystemTime(new Date('2026-03-21T15:45:00.000Z'));

    expect(getCurrentDayAyah()).toEqual({ chapter: 2, verse: 2 });
  });

  it('uses the UTC date instead of the local timezone date', async () => {
    const getCurrentDayAyah = await loadGetCurrentDayAyah([
      { date: '20/03/2026', verseKey: '1:2' },
      { date: '21/03/2026', verseKey: '2:2' },
    ]);

    vi.setSystemTime(new Date('2026-03-20T23:30:00.000-05:00'));

    expect(getCurrentDayAyah()).toEqual({ chapter: 2, verse: 2 });
  });

  it('returns the last entry when the target date matches the last available date', async () => {
    const getCurrentDayAyah = await loadGetCurrentDayAyah(multipleAyahEntries);

    vi.setSystemTime(new Date('2026-03-24T23:59:59.000Z'));

    expect(getCurrentDayAyah()).toEqual({ chapter: 2, verse: 44 });
  });
});

describe('getCurrentDayAyah fallback behavior', () => {
  it('falls back to the previous ayah when a middle date is missing', async () => {
    const getCurrentDayAyah = await loadGetCurrentDayAyah(multipleAyahEntries);

    vi.setSystemTime(new Date('2026-03-23T08:00:00.000Z'));

    expect(getCurrentDayAyah()).toEqual({ chapter: 2, verse: 21 });
  });

  it('falls back to the next ayah when the target date is before the first entry', async () => {
    const getCurrentDayAyah = await loadGetCurrentDayAyah(multipleAyahEntries);

    vi.setSystemTime(new Date('2026-03-19T23:59:59.000Z'));

    expect(getCurrentDayAyah()).toEqual({ chapter: 1, verse: 2 });
  });

  it('falls back to the last ayah when the target date is after the final entry', async () => {
    const getCurrentDayAyah = await loadGetCurrentDayAyah(multipleAyahEntries);

    vi.setSystemTime(new Date('2026-03-25T00:00:00.000Z'));

    expect(getCurrentDayAyah()).toEqual({ chapter: 2, verse: 44 });
  });

  it('clamps to the first configured ayah before the configured range starts', async () => {
    const getCurrentDayAyah = await loadGetCurrentDayAyah([
      { date: '20/03/2026', verseKey: '1:2' },
      { date: '21/03/2026', verseKey: '2:2' },
      { date: '04/02/2027', verseKey: '112:1' },
    ]);

    vi.setSystemTime(new Date('2026-03-01T12:00:00.000Z'));

    expect(getCurrentDayAyah()).toEqual({ chapter: 1, verse: 2 });
  });

  it('clamps to the last configured ayah after the configured range ends', async () => {
    const getCurrentDayAyah = await loadGetCurrentDayAyah([
      { date: '20/03/2026', verseKey: '1:2' },
      { date: '21/03/2026', verseKey: '2:2' },
      { date: '04/02/2027', verseKey: '112:1' },
    ]);

    vi.setSystemTime(new Date('2027-02-20T12:00:00.000Z'));

    expect(getCurrentDayAyah()).toEqual({ chapter: 112, verse: 1 });
  });

  it('prefers the previous ayah even when the next ayah is chronologically closer', async () => {
    const getCurrentDayAyah = await loadGetCurrentDayAyah(spacedAyahEntries);

    vi.setSystemTime(new Date('2027-01-18T12:00:00.000Z'));

    expect(getCurrentDayAyah()).toEqual({ chapter: 2, verse: 255 });
  });

  it('keeps falling back to the latest previous ayah across multiple missing days', async () => {
    const getCurrentDayAyah = await loadGetCurrentDayAyah(spacedAyahEntries);

    vi.setSystemTime(new Date('2027-01-27T18:30:00.000Z'));

    expect(getCurrentDayAyah()).toEqual({ chapter: 18, verse: 10 });
  });
});

describe('getCurrentDayAyah edge cases', () => {
  it('parses multi-digit chapter and verse values correctly', async () => {
    const getCurrentDayAyah = await loadGetCurrentDayAyah([
      { date: '04/02/2027', verseKey: '112:1' },
    ]);

    vi.setSystemTime(new Date('2027-02-04T10:00:00.000Z'));

    expect(getCurrentDayAyah()).toEqual({ chapter: 112, verse: 1 });
  });

  it('returns the single available ayah for dates before and after when only one entry exists', async () => {
    const getCurrentDayAyah = await loadGetCurrentDayAyah([
      { date: '20/03/2026', verseKey: '1:2' },
    ]);

    vi.setSystemTime(new Date('2026-03-10T12:00:00.000Z'));
    expect(getCurrentDayAyah()).toEqual({ chapter: 1, verse: 2 });

    vi.setSystemTime(new Date('2026-03-30T12:00:00.000Z'));
    expect(getCurrentDayAyah()).toEqual({ chapter: 1, verse: 2 });
  });

  it('returns null when there is no ayah data', async () => {
    const getCurrentDayAyah = await loadGetCurrentDayAyah([]);

    vi.setSystemTime(new Date('2026-03-21T00:00:00.000Z'));

    expect(getCurrentDayAyah()).toBeNull();
  });

  it('returns different results for repeated calls on different UTC days', async () => {
    const getCurrentDayAyah = await loadGetCurrentDayAyah([
      { date: '20/03/2026', verseKey: '1:2' },
      { date: '21/03/2026', verseKey: '2:2' },
      { date: '22/03/2026', verseKey: '2:21' },
    ]);

    vi.setSystemTime(new Date('2026-03-20T12:00:00.000Z'));
    expect(getCurrentDayAyah()).toEqual({ chapter: 1, verse: 2 });

    vi.setSystemTime(new Date('2026-03-21T12:00:00.000Z'));
    expect(getCurrentDayAyah()).toEqual({ chapter: 2, verse: 2 });

    vi.setSystemTime(new Date('2026-03-23T12:00:00.000Z'));
    expect(getCurrentDayAyah()).toEqual({ chapter: 2, verse: 21 });
  });
});

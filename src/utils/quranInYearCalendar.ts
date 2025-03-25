import quranStructure from './quranStructure';

// The date range for Quran in a Year: April 1, 2025 to February 28, 2026 (in GMT/UTC)
const START_DATE = new Date(Date.UTC(2025, 3, 4)); // Month is 0-indexed, so 3 = April
const END_DATE = new Date(Date.UTC(2026, 1, 28)); // 1 = February
const TOTAL_DAYS =
  Math.ceil((END_DATE.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24)) + 1;

const CUSTOM_DATE_VERSES: Record<string, { chapter: number; verse: number }> = {
  '2025-03-25': { chapter: 39, verse: 53 },
  '2025-03-26': { chapter: 9, verse: 124 },
  '2025-03-27': { chapter: 67, verse: 30 },
  '2025-03-28': { chapter: 47, verse: 31 },
  '2025-03-29': { chapter: 25, verse: 71 },
  '2025-03-30': { chapter: 57, verse: 6 },
  '2025-03-31': { chapter: 38, verse: 29 },
  '2025-04-01': { chapter: 57, verse: 16 },
  '2025-04-02': { chapter: 59, verse: 23 },
  '2025-04-03': { chapter: 63, verse: 9 },
};

/**
 * Get the Ayah that corresponds to the current date based on the Quran in a Year schedule.
 * Uses GMT/UTC timing to ensure consistency across different timezones.
 * If the current date is outside the schedule range, return the first Ayah of the Quran.
 *
 * @returns {object} Object containing chapter and verse number
 */
const getCurrentDayAyah = (): { chapter: number; verse: number } | null => {
  // Get current date in GMT/UTC
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  // Format today's date as YYYY-MM-DD for lookup
  const dateString = today.toISOString().split('T')[0];

  // Check if there's a custom verse assigned for this date
  if (CUSTOM_DATE_VERSES[dateString]) {
    return CUSTOM_DATE_VERSES[dateString];
  }

  // If the current date is outside the schedule range, return null since the program is over
  if (today > END_DATE) {
    return null;
  }

  // Calculate the day number (1-indexed) in the program
  const dayNumber = Math.ceil((today.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Calculate total verses in the Quran
  const totalVerses = quranStructure.reduce((sum, chapter) => sum + chapter.verses, 0);

  // Calculate which verse of the Quran we should display today
  // We're distributing the verses evenly across the total days
  const verseIndex = Math.floor((dayNumber / TOTAL_DAYS) * totalVerses);

  // Find which chapter and verse this corresponds to
  let versesSum = 0;
  for (let i = 0; i < quranStructure.length; i += 1) {
    const chapterVerses = quranStructure[i].verses;
    if (versesSum + chapterVerses > verseIndex) {
      // We found our chapter
      return {
        chapter: quranStructure[i].chapter,
        verse: verseIndex - versesSum + 1, // +1 because verses are 1-indexed
      };
    }
    versesSum += chapterVerses;
  }

  // Fallback (should never reach here with valid data)
  return { chapter: 1, verse: 1 };
};

export default getCurrentDayAyah;

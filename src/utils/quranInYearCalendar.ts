import quranStructure from './quranStructure';

// The date range for Quran in a Year: April 1, 2025 to February 28, 2026 (in GMT/UTC)
const START_DATE = new Date(Date.UTC(2025, 3, 4)); // Month is 0-indexed, so 3 = April
const END_DATE = new Date(Date.UTC(2026, 1, 28)); // 1 = February
const TOTAL_DAYS =
  Math.ceil((END_DATE.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24)) + 1;

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
  const startDate = new Date(Date.UTC(2025, 3, 1)); // April 1, 2025

  // Return null if we're before April 1st, 2025
  if (today < startDate) {
    return null;
  }

  // Handle special cases for the first three days of April 2025
  if (today.getUTCFullYear() === 2025 && today.getUTCMonth() === 3) {
    // 3 = April
    const day = today.getUTCDate();
    if (day === 1) return { chapter: 57, verse: 16 };
    if (day === 2) return { chapter: 59, verse: 23 };
    if (day === 3) return { chapter: 63, verse: 9 };
  }

  // Check if we're within the valid date range for the program
  if (today > END_DATE) {
    return { chapter: 1, verse: 1 }; // Default to the first verse of the Quran
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

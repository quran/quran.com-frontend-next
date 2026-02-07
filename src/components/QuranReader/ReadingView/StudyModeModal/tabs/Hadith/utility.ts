import Language from '@/types/Language';
import { getHadithLanguage } from '@/utils/hadith';
import { toLocalizedNumber } from '@/utils/locale';

/**
 * Replaces <br> tags with <span> elements based on their consecutiveness.
 * Multiple consecutive <br> tags are replaced with a single <span class="multiline">.
 * Single <br> tags are replaced with <span class="single">.
 * @param {string} html - The HTML string to process
 * @returns {string} The processed HTML string with <br> tags replaced by spans
 */
export const replaceBreaksWithSpans = (html: string): string => {
  // Match 2 or more consecutive <br> tags (with optional self-closing and spacing)
  // and replace with multiline span
  const multilinePattern = /(<br\s*\/?>\s*){2,}/gi;
  const result = html.replace(multilinePattern, '<span class="multiline"></span>');

  // Match single <br> tags and replace with single span
  const singlePattern = /<br\s*\/?>/gi;
  const finalResult = result.replace(singlePattern, '<span class="single"></span>');

  return finalResult;
};

export interface ParsedHadithNumber {
  number: string;
  letter?: string;
  localized: string;
  link: string;
}

/**
 * Format a single hadith number with localization
 *
 * @param {string} number - The hadith number
 * @param {string} letter - Optional letter suffix
 * @param {Language} language - The target language
 * @returns {string} - Formatted hadith number
 */
const formatSingleHadithNumber = (
  number: string,
  letter: string | undefined,
  language: Language,
): string => {
  const localizedNumber = toLocalizedNumber(Number(number), getHadithLanguage(language), false, {
    useGrouping: false,
  });

  return letter ? `${localizedNumber}${letter}` : localizedNumber;
};

/**
 * Parse hadith numbers from a string
 * Supports formats like: "1", "1,2,3", "1a,2b", "1 a, 2 b", "1 a,2b"
 *
 * @param {string} hadithNumbersString - The hadith numbers string
 * @returns {ParsedHadithNumber[]} - Array of parsed hadith numbers
 */
export const parseHadithNumbers = (
  hadithNumbersString: string,
  language: Language,
): ParsedHadithNumber[] => {
  if (!hadithNumbersString || typeof hadithNumbersString !== 'string') return [];

  // Split by comma and trim each part
  const parts = hadithNumbersString
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  return parts
    .map((part) => {
      // Match pattern: number followed by optional letter (with or without space)
      // Examples: "1", "1a", "1 a", "123b", "123 b"
      const match = part.match(/^(\d+)(?:\s*([a-zA-Z]))?$/);
      if (match) return { number: match[1], letter: match[2]?.toLowerCase() };
      return { number: part, letter: undefined };
    })
    .map((value) => {
      const localizedNumber = formatSingleHadithNumber(value.number, value.letter, language);
      const link = value.letter ? `${value.number}${value.letter}` : value.number;
      return { ...value, link, localized: localizedNumber };
    });
};

/**
 * Format all hadith numbers from a string with localization
 * Returns a comma-separated list of formatted hadith numbers
 *
 * @param {string} hadithNumbersString - The hadith numbers string (e.g., "1,2a,3 b")
 * @param {Language} language - The target language
 * @returns {string} - Formatted hadith numbers string (e.g., "١, ٢a, ٣ b" for Arabic)
 */
export const formatHadithNumbers = (hadithNumbersString: string, language: Language): string => {
  const parsedNumbers = parseHadithNumbers(hadithNumbersString, language);
  return parsedNumbers.map((parsed) => parsed.localized).join(', ');
};

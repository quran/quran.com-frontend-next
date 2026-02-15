const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Maps chapter ID to the corresponding character in the Surah fonts.
 * This function implements the specific character mapping required for
 * the custom Surah name fonts where each chapter is mapped to a specific
 * ASCII character rather than using the chapter number directly.
 *
 * @param {number} chapterId - The chapter ID (1-114)
 * @returns {string} The character that corresponds to this chapter in the font
 */
export const chapterIdToSurahCharacter = (chapterId: number): string => {
  // Validate chapter ID
  if (chapterId < 1 || chapterId > 114) {
    throw new Error(`Invalid chapter ID: ${chapterId}. Must be between 1 and 114.`);
  }

  // from 1-9 return the number
  if (chapterId < 10) return chapterId.toString();

  // from 10-33 return a letter from A to X lowercase
  if (chapterId >= 10 && chapterId <= 33) return letters[chapterId - 10].toLowerCase();

  // 34-59 return a letter from A to Z uppercase
  if (chapterId >= 34 && chapterId <= 59) return letters[chapterId - 34];

  // 60-85 return a letter from A to Z lowercase
  if (chapterId >= 60 && chapterId <= 85) return letters[chapterId - 60].toLowerCase();

  // 86-105 return a letter from G to Z uppercase
  if (chapterId >= 86 && chapterId <= 105) return letters[chapterId - 86 + 6];

  // 106-114 return a number from 1 to 9
  return (chapterId - 106 + 1).toString();
};

/**
 * Determines which font file should be used for a given chapter ID.
 * Chapters 1-59 use the first font, chapters 60-114 use the second font.
 *
 * @param {number} chapterId - The chapter ID (1-114)
 * @returns {string} The font version identifier ('v1' or 'v2')
 */
export const getSurahFontVersion = (chapterId: number): 'v1' | 'v2' => {
  if (chapterId < 1 || chapterId > 114) {
    throw new Error(`Invalid chapter ID: ${chapterId}. Must be between 1 and 114.`);
  }

  return chapterId <= 59 ? 'v1' : 'v2';
};

/**
 * Gets the font family name for a given chapter ID based on the font version.
 *
 * @param {number} chapterId - The chapter ID (1-114)
 * @returns {string} The font family name ('SurahV1' or 'SurahV2')
 */
export const getSurahFontFamily = (chapterId: number): 'SurahV1' | 'SurahV2' => {
  const version = getSurahFontVersion(chapterId);
  return version === 'v1' ? 'SurahV1' : 'SurahV2';
};

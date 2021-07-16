/* eslint-disable import/prefer-default-export */

/**
 * Validate a chapterId which can be in-valid in 2 cases:
 *
 * 1. if it's a string that is not numeric e.g. "test".
 * 2. if it's a numeric string but lies outside the range 1->114.
 *
 * @param {string} chapterId
 * @returns {boolean}
 */
export const isValidChapterId = (chapterId: string): boolean => {
  const chapterIdNumber = Number(chapterId);
  // if it's not a numeric string or it's numeric but out of the range of chapter 1->114
  if (Number.isNaN(chapterIdNumber) || chapterIdNumber > 114 || chapterIdNumber < 1) {
    return false;
  }
  return true;
};

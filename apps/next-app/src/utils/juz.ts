import { toLocalizedNumber } from './locale';

/**
 * Get the juz number by the hiz number. One hizb is half a Juz.
 *
 * @param {number} hizb
 * @returns {number}
 */
export const getJuzNumberByHizb = (hizb: number): number => Math.ceil(hizb / 2);

/**
 * Whether the current juz is the first surah.
 *
 * @param {number} juzNumber
 * @returns  {boolean}
 */
export const isFirstJuz = (juzNumber: number): boolean => juzNumber === 1;

/**
 * Whether the current juz is the last surah.
 *
 * @param {number} juzNumber
 * @returns  {boolean}
 */
export const isLastJuz = (juzNumber: number): boolean => juzNumber === 30;

const TOTAL_QURAN_JUZ = 30;
export const getJuzIds = (lang: string) => {
  return [...Array(TOTAL_QURAN_JUZ)].map((n, index) => {
    const juz = index + 1;
    return {
      value: juz,
      label: toLocalizedNumber(juz, lang),
    };
  });
};

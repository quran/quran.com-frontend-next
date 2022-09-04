import { toLocalizedNumber } from './locale';

/**
 * Whether the current hizb is the first surah.
 *
 * @param {number} hizbNumber
 * @returns  {boolean}
 */
export const isFirstHizb = (hizbNumber: number): boolean => hizbNumber === 1;

/**
 * Whether the current hizb is the last surah.
 *
 * @param {number} hizbNumber
 * @returns  {boolean}
 */
export const isLastHizb = (hizbNumber: number): boolean => hizbNumber === 60;

const TOTAL_QURAN_HIZB = 60;
export const getHizbIds = (lang: string) => {
  return [...Array(TOTAL_QURAN_HIZB)].map((n, index) => {
    const hizb = index + 1;
    return {
      value: hizb,
      label: toLocalizedNumber(hizb, lang),
    };
  });
};

/**
 * Given a hizbId, get chapters ids from a json file
 *
 * @param {string} hizbId
 * @returns {string[]} chapterIds
 */
export const getChapterIdsForHizb = async (hizbId: string): Promise<string[]> => {
  return new Promise((res) => {
    import(`@/data/hizb-to-chapter-mappings.json`).then((data) => {
      res(data.default[hizbId]);
    });
  });
};

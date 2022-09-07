import { toLocalizedNumber } from './locale';

const TOTAL_QURAN_RUB_EL_HIZB = 240;
/**
 * Whether the current Rub is the first Rub El Hizb.
 *
 * @param {number} rubNumber
 * @returns  {boolean}
 */
export const isFirstRub = (rubNumber: number): boolean => rubNumber === 1;

/**
 * Whether the current Rub is the last Rub El Hizb.
 *
 * @param {number} rubNumber
 * @returns  {boolean}
 */
export const isLastRub = (rubNumber: number): boolean => rubNumber === TOTAL_QURAN_RUB_EL_HIZB;

export const getRubIds = (lang: string) => {
  return [...Array(TOTAL_QURAN_RUB_EL_HIZB)].map((n, index) => {
    const rub = index + 1;
    return {
      value: rub,
      label: toLocalizedNumber(rub, lang),
    };
  });
};

export const getChapterIdsForRub = async (rubId: string): Promise<string[]> => {
  return new Promise((res) => {
    import(`@/data/rub-el-hizb-to-chapter-mappings.json`).then((data) => {
      res(data.default[rubId]);
    });
  });
};

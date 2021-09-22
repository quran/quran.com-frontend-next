/* eslint-disable import/prefer-default-export */

/**
 * Get the juz number by the hiz number. One hizb is half a Juz.
 *
 * @param {number} hizb
 * @returns {number}
 */
export const getJuzNumberByHizb = (hizb: number): number => Math.ceil(hizb / 2);

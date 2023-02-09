/* eslint-disable import/prefer-default-export */
/**
 * This function returns a number string after making sure
 * it's in the valid format. e.g.
 * 1   -> 1
 * 001 -> 1
 *
 * @param {string} number
 * @returns {string}
 */
export const formatStringNumber = (number: string) => String(Number(number));

/**
 * This function returns a percentage of the part number from the total number.
 *
 * @param {number} part
 * @param {number} total
 * @returns {number}
 */
export const getPercentage = (part: number, total: number): number =>
  Number(Math.min((part / total) * 100, 100).toFixed(1));

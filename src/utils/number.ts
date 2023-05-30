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
export const formatStringNumber = (number: string): string => String(Number(number));

/**
 * This function takes a fraction (a number between 0 and 1) and converts it to a percent number (limited to 100).
 *
 * @param {string | number} fraction a number between 0 and 1
 * @param {number} decimalPoints number of decimal points
 * @returns {number} a number between 0 and 100
 */
export const convertFractionToPercent = (fraction: string | number, decimalPoints = 1): number => {
  const number = convertNumberToDecimal(Number(fraction) * 100, decimalPoints);
  return Math.min(number, 100);
};

/**
 * This function takes a number and converts it to a decimal number.
 *
 * @param {string | number} number
 * @param {number} decimalPoints number of decimal points
 * @returns {number}
 */
export const convertNumberToDecimal = (number: string | number, decimalPoints = 1): number => {
  return Number((typeof number === 'string' ? Number(number) : number).toFixed(decimalPoints));
};

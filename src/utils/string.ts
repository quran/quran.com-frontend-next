/* eslint-disable import/prefer-default-export */

/**
 * Join an array of string items by a comma.
 *
 * @param {string[]} stringsArray  e.g. ["1", "2", "3"]
 * @returns  {string} e.g. "1, 2, 3"
 */
export const joinStringArray = (stringsArray: string[]): string => stringsArray.join(', ');

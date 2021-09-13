import isEqual from 'lodash/isEqual';

/**
 * Convert an array of numbers to an array of strings.
 *
 * @param {number[]} numbersArray
 * @returns {string[]}
 */
export const numbersToStringsArray = (numbersArray: number[]): string[] =>
  numbersArray.map((number) => String(number));

/**
 * Convert an array of strings to an array of numbers.
 * @param stringsArray
 * @returns
 */
export const stringsToNumbersArray = (stringsArray: string[]): number[] =>
  stringsArray.map((string) => Number(string));

/**
 * Check whether 2 arrays are equal or not irrespective of
 * their order. We need to create a copy of both arrays first
 * since sort() overwrites the original array.
 *
 * @param {number[]} array1
 * @param {number[]} array2
 * @returns {boolean}
 */
export const areArraysEquals = (array1: number[], array2: number[]): boolean =>
  isEqual([...array1].sort(), [...array2].sort());

import { it, expect } from 'vitest';

import { stringsToNumbersArray } from '../../array';

it('should convert an empty array of strings to an empty array of numbers', () => {
  expect(stringsToNumbersArray([])).toEqual([]);
});

it('should convert an array of positive numbers as strings to an array of numbers', () => {
  const input = ['1', '2', '3'];
  const expectedOutput = [1, 2, 3];
  expect(stringsToNumbersArray(input)).toEqual(expectedOutput);
});

it('should convert an array of negative numbers as strings to an array of numbers', () => {
  const input = ['-1', '-2', '-3'];
  const expectedOutput = [-1, -2, -3];
  expect(stringsToNumbersArray(input)).toEqual(expectedOutput);
});

it('should convert an array of mixed numbers as strings to an array of numbers', () => {
  const input = ['-1', '0', '1'];
  const expectedOutput = [-1, 0, 1];
  expect(stringsToNumbersArray(input)).toEqual(expectedOutput);
});

it('should not modify the original array', () => {
  const input = ['1', '2', '3'];
  stringsToNumbersArray(input);
  expect(input).toEqual(['1', '2', '3']);
});

it('should return a new array instance', () => {
  const input = ['1', '2', '3'];
  const output = stringsToNumbersArray(input);
  expect(output).not.toBe(input);
});

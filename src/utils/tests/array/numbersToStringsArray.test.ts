import { it, expect } from 'vitest';

import { numbersToStringsArray } from '../../array';

it('should convert an empty array of numbers to an empty array of strings', () => {
  expect(numbersToStringsArray([])).toEqual([]);
});

it('should convert an array of positive numbers to an array of strings', () => {
  const input = [1, 2, 3];
  const expectedOutput = ['1', '2', '3'];

  expect(numbersToStringsArray(input)).toEqual(expectedOutput);
});

it('should convert an array of negative numbers to an array of strings', () => {
  const input = [-1, -2, -3];
  const expectedOutput = ['-1', '-2', '-3'];

  expect(numbersToStringsArray(input)).toEqual(expectedOutput);
});

it('should convert an array of mixed numbers to an array of strings', () => {
  const input = [-1, 0, 1];
  const expectedOutput = ['-1', '0', '1'];

  expect(numbersToStringsArray(input)).toEqual(expectedOutput);
});

it('should not modify the original array', () => {
  const input = [1, 2, 3];
  numbersToStringsArray(input);

  expect(input).toEqual([1, 2, 3]);
});

it('should return a new array instance', () => {
  const input = [1, 2, 3];
  const output = numbersToStringsArray(input);

  expect(output).not.toBe(input);
});

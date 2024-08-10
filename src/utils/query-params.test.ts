/* eslint-disable react-func/max-lines-per-function */
import { describe, it, expect } from 'vitest';

import {
  getQueryParamValueByType,
  isQueryParamDifferentThanReduxValue,
  QueryParamValueType,
  equalityCheckerByType,
  paramValueParser,
} from './query-params';

describe('query-params', () => {
  describe('getQueryParamValueByType', () => {
    it('should parse string values correctly', () => {
      expect(getQueryParamValueByType('test', QueryParamValueType.String)).toBe('test');
    });

    it('should parse number values correctly', () => {
      expect(getQueryParamValueByType('123', QueryParamValueType.Number)).toBe(123);
    });

    it('should parse array of numbers correctly', () => {
      expect(getQueryParamValueByType('1,2,3', QueryParamValueType.ArrayOfNumbers)).toEqual([
        1, 2, 3,
      ]);
    });

    it('should parse array of strings correctly', () => {
      expect(getQueryParamValueByType('a,b,c', QueryParamValueType.ArrayOfStrings)).toEqual([
        'a',
        'b',
        'c',
      ]);
    });

    it('should parse boolean values correctly', () => {
      expect(getQueryParamValueByType('true', QueryParamValueType.Boolean)).toBe(true);
      expect(getQueryParamValueByType('false', QueryParamValueType.Boolean)).toBe(false);
    });
  });

  describe('getIsQueryParamDifferent', () => {
    it('should detect different string values', () => {
      expect(
        isQueryParamDifferentThanReduxValue('test1', QueryParamValueType.String, 'test2'),
      ).toBe(true);
    });

    it('should detect same string values', () => {
      expect(isQueryParamDifferentThanReduxValue('test', QueryParamValueType.String, 'test')).toBe(
        false,
      );
    });

    it('should detect different number values', () => {
      expect(isQueryParamDifferentThanReduxValue('123', QueryParamValueType.Number, 456)).toBe(
        true,
      );
    });

    it('should detect same number values', () => {
      expect(isQueryParamDifferentThanReduxValue('123', QueryParamValueType.Number, 123)).toBe(
        false,
      );
    });

    it('should detect different array of numbers', () => {
      expect(
        isQueryParamDifferentThanReduxValue('1,2,3', QueryParamValueType.ArrayOfNumbers, [4, 5, 6]),
      ).toBe(true);
    });

    it('should detect same array of numbers', () => {
      expect(
        isQueryParamDifferentThanReduxValue('1,2,3', QueryParamValueType.ArrayOfNumbers, [1, 2, 3]),
      ).toBe(false);
    });

    it('should detect different array of strings', () => {
      expect(
        isQueryParamDifferentThanReduxValue('a,b,c', QueryParamValueType.ArrayOfStrings, [
          'd',
          'e',
          'f',
        ]),
      ).toBe(true);
    });

    it('should detect same array of strings', () => {
      expect(
        isQueryParamDifferentThanReduxValue('a,b,c', QueryParamValueType.ArrayOfStrings, [
          'a',
          'b',
          'c',
        ]),
      ).toBe(false);
    });

    it('should detect different boolean values', () => {
      expect(isQueryParamDifferentThanReduxValue('true', QueryParamValueType.Boolean, false)).toBe(
        true,
      );
    });

    it('should detect same boolean values', () => {
      expect(isQueryParamDifferentThanReduxValue('true', QueryParamValueType.Boolean, true)).toBe(
        false,
      );
    });
  });

  describe('paramValueParser', () => {
    it('should parse array of numbers correctly', () => {
      expect(paramValueParser[QueryParamValueType.ArrayOfNumbers]('1,2,3')).toEqual([1, 2, 3]);
    });

    it('should parse array of strings correctly', () => {
      expect(paramValueParser[QueryParamValueType.ArrayOfStrings]('a,b,c')).toEqual([
        'a',
        'b',
        'c',
      ]);
    });

    it('should parse number correctly', () => {
      expect(paramValueParser[QueryParamValueType.Number]('123')).toBe(123);
    });

    it('should parse string correctly', () => {
      expect(paramValueParser[QueryParamValueType.String]('test')).toBe('test');
    });

    it('should parse boolean correctly', () => {
      expect(paramValueParser[QueryParamValueType.Boolean]('true')).toBe(true);
      expect(paramValueParser[QueryParamValueType.Boolean]('false')).toBe(false);
    });
  });

  describe('equalityCheckerByType', () => {
    it('should check equality of arrays correctly', () => {
      expect(equalityCheckerByType[QueryParamValueType.ArrayOfNumbers]([1, 2, 3], [1, 2, 3])).toBe(
        true,
      );
      expect(
        equalityCheckerByType[QueryParamValueType.ArrayOfStrings](['a', 'b', 'c'], ['a', 'b', 'c']),
      ).toBe(true);
    });

    it('should check equality of strings correctly', () => {
      expect(equalityCheckerByType[QueryParamValueType.String]('test', 'test')).toBe(true);
    });

    it('should check equality of numbers correctly', () => {
      expect(equalityCheckerByType[QueryParamValueType.Number](123, 123)).toBe(true);
    });

    it('should check equality of booleans correctly', () => {
      expect(equalityCheckerByType[QueryParamValueType.Boolean](true, true)).toBe(true);
    });
  });
});

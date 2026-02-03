/* eslint-disable react-func/max-lines-per-function */
import { describe, it, expect } from 'vitest';

import {
  fromPersistedValue,
  toPersistedValue,
  normalizeVerseRange,
  isVerseInChapter,
} from './RepeatAudioModal.helpers';

import { REPEAT_INFINITY } from '@/redux/types/AudioState';

describe('RepeatAudioModal.helpers', () => {
  describe('fromPersistedValue', () => {
    it('should return fallback when value is undefined', () => {
      expect(fromPersistedValue(undefined, 5)).toBe(5);
    });

    it('should convert REPEAT_INFINITY (-1) to Infinity', () => {
      expect(fromPersistedValue(REPEAT_INFINITY, 2)).toBe(Infinity);
    });

    it('should return the value as-is for normal numbers', () => {
      expect(fromPersistedValue(3, 2)).toBe(3);
      expect(fromPersistedValue(0, 2)).toBe(0);
      expect(fromPersistedValue(100, 2)).toBe(100);
    });
  });

  describe('toPersistedValue', () => {
    it('should convert Infinity to REPEAT_INFINITY (-1)', () => {
      expect(toPersistedValue(Infinity)).toBe(REPEAT_INFINITY);
    });

    it('should convert non-finite values to REPEAT_INFINITY (-1)', () => {
      // NOTE: we normalize all non-finite values (including NaN) to REPEAT_INFINITY
      // to avoid persisting invalid numbers and keep the storage format consistent.
      expect(toPersistedValue(NaN)).toBe(REPEAT_INFINITY);
    });

    it('should return normal numbers as-is', () => {
      expect(toPersistedValue(3)).toBe(3);
      expect(toPersistedValue(0)).toBe(0);
      expect(toPersistedValue(100)).toBe(100);
    });
  });

  describe('normalizeVerseRange', () => {
    it('should keep from/to when from <= to', () => {
      const result = normalizeVerseRange('1:1', '1:7');
      expect(result).toEqual({ from: '1:1', to: '1:7' });
    });

    it('should keep from/to when they are equal', () => {
      const result = normalizeVerseRange('1:3', '1:3');
      expect(result).toEqual({ from: '1:3', to: '1:3' });
    });

    it('should swap from/to when from > to', () => {
      const result = normalizeVerseRange('1:5', '1:2');
      expect(result).toEqual({ from: '1:2', to: '1:5' });
    });

    it('should handle multi-digit verse numbers', () => {
      const result = normalizeVerseRange('2:286', '2:1');
      expect(result).toEqual({ from: '2:1', to: '2:286' });
    });

    it('should handle verses from the same chapter', () => {
      const result = normalizeVerseRange('3:10', '3:5');
      expect(result).toEqual({ from: '3:5', to: '3:10' });
    });

    it('should return as-is when verses are from different chapters', () => {
      // Edge case: shouldn't happen in normal usage, but handled gracefully
      const result = normalizeVerseRange('2:10', '1:5');
      expect(result).toEqual({ from: '2:10', to: '1:5' });
    });
  });

  describe('isVerseInChapter', () => {
    it('should return false when verseKey is undefined', () => {
      expect(isVerseInChapter(undefined, 1)).toBe(false);
    });

    it('should return true when verse belongs to the chapter', () => {
      expect(isVerseInChapter('1:1', 1)).toBe(true);
      expect(isVerseInChapter('1:7', 1)).toBe(true);
      expect(isVerseInChapter('2:255', 2)).toBe(true);
    });

    it('should return false when verse does not belong to the chapter', () => {
      expect(isVerseInChapter('1:1', 2)).toBe(false);
      expect(isVerseInChapter('2:255', 1)).toBe(false);
      expect(isVerseInChapter('3:10', 5)).toBe(false);
    });

    it('should handle multi-digit chapter numbers', () => {
      expect(isVerseInChapter('114:6', 114)).toBe(true);
      expect(isVerseInChapter('114:6', 113)).toBe(false);
    });
  });
});

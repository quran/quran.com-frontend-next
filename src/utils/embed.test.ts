/* eslint-disable import/no-unresolved */
/* eslint-disable import/order */
/* eslint-disable max-lines */
import { it, expect, describe } from 'vitest';

import {
  parseVerseRange,
  parseTranslations,
  parseBooleanParam,
  parseEmbedConfig,
  isValidChapterAndVerse,
  MAX_EMBED_VERSES,
  generateEmbedUrl,
} from './embed';

import { EmbedTextAlignment, EmbedTheme } from '../../types/Embed';

describe('parseVerseRange', () => {
  it('should parse single verse format', () => {
    const result = parseVerseRange('1:1');
    expect(result).toEqual({ chapterId: 1, fromVerse: 1, toVerse: 1 });
  });

  it('should parse verse range format', () => {
    const result = parseVerseRange('2:5-10');
    expect(result).toEqual({ chapterId: 2, fromVerse: 5, toVerse: 10 });
  });

  it('should return null for empty string', () => {
    expect(parseVerseRange('')).toBeNull();
  });

  it('should return null for invalid format', () => {
    expect(parseVerseRange('invalid')).toBeNull();
    expect(parseVerseRange('1')).toBeNull();
    expect(parseVerseRange('1:a')).toBeNull();
    expect(parseVerseRange('a:1')).toBeNull();
  });

  it('should return null for reversed range', () => {
    expect(parseVerseRange('1:10-5')).toBeNull();
  });

  it('should limit to MAX_EMBED_VERSES', () => {
    const result = parseVerseRange('1:1-50');
    expect(result).not.toBeNull();
    expect(result?.toVerse).toBe(1 + MAX_EMBED_VERSES - 1);
  });
});

describe('parseTranslations', () => {
  it('should parse comma-separated translation IDs', () => {
    const result = parseTranslations('131,20,85');
    expect(result).toEqual([131, 20, 85]);
  });

  it('should handle single translation ID', () => {
    const result = parseTranslations('131');
    expect(result).toEqual([131]);
  });

  it('should filter out invalid IDs', () => {
    const result = parseTranslations('131,invalid,20');
    expect(result).toEqual([131, 20]);
  });

  it('should return empty array for undefined', () => {
    expect(parseTranslations(undefined)).toEqual([]);
  });

  it('should return empty array for empty string', () => {
    expect(parseTranslations('')).toEqual([]);
  });
});

describe('parseBooleanParam', () => {
  it('should return true for "true"', () => {
    expect(parseBooleanParam('true', false)).toBe(true);
  });

  it('should return true for "1"', () => {
    expect(parseBooleanParam('1', false)).toBe(true);
  });

  it('should return false for "false"', () => {
    expect(parseBooleanParam('false', true)).toBe(false);
  });

  it('should return default for undefined', () => {
    expect(parseBooleanParam(undefined, true)).toBe(true);
    expect(parseBooleanParam(undefined, false)).toBe(false);
  });
});

describe('isValidChapterAndVerse', () => {
  it('should return true for valid input', () => {
    expect(isValidChapterAndVerse(1, 1, 7)).toBe(true);
    expect(isValidChapterAndVerse(114, 1, 6)).toBe(true);
  });

  it('should return false for invalid chapter', () => {
    expect(isValidChapterAndVerse(0, 1, 1)).toBe(false);
    expect(isValidChapterAndVerse(115, 1, 1)).toBe(false);
  });

  it('should return false for invalid verse numbers', () => {
    expect(isValidChapterAndVerse(1, 0, 1)).toBe(false);
    expect(isValidChapterAndVerse(1, -1, 1)).toBe(false);
  });

  it('should return false when fromVerse > toVerse', () => {
    expect(isValidChapterAndVerse(1, 5, 3)).toBe(false);
  });
});

describe('parseEmbedConfig', () => {
  it('should parse valid config', () => {
    const result = parseEmbedConfig({ verses: '1:1-7', translations: '131,20' });
    expect(result).not.toBeNull();
    expect(result?.chapterId).toBe(1);
    expect(result?.fromVerse).toBe(1);
    expect(result?.toVerse).toBe(7);
    expect(result?.translations).toEqual([131, 20]);
  });

  it('should return null for missing verses', () => {
    expect(parseEmbedConfig({})).toBeNull();
  });

  it('should use default values', () => {
    const result = parseEmbedConfig({ verses: '1:1' });
    expect(result?.theme).toBe(EmbedTheme.Light);
    expect(result?.showReference).toBe(true);
    expect(result?.showTranslationName).toBe(true);
    expect(result?.textAlign).toBe(EmbedTextAlignment.Start);
  });

  it('should parse theme correctly', () => {
    const result = parseEmbedConfig({ verses: '1:1', theme: 'dark' });
    expect(result?.theme).toBe(EmbedTheme.Dark);
  });
});

describe('generateEmbedUrl', () => {
  it('should generate basic URL', () => {
    const url = generateEmbedUrl({ chapterId: 1, fromVerse: 1, toVerse: 1 });
    expect(url).toContain('verses=1%3A1');
  });

  it('should generate URL with range', () => {
    const url = generateEmbedUrl({ chapterId: 1, fromVerse: 1, toVerse: 7 });
    expect(url).toContain('verses=1%3A1-7');
  });

  it('should include translations', () => {
    const url = generateEmbedUrl({
      chapterId: 1,
      fromVerse: 1,
      toVerse: 1,
      translations: [131, 20],
    });
    expect(url).toContain('translations=131%2C20');
  });

  it('should include base URL', () => {
    const url = generateEmbedUrl({ chapterId: 1, fromVerse: 1 }, 'https://quran.com');
    expect(url).toContain('https://quran.com/embed/v1');
  });
});

import { describe, it, expect } from 'vitest';

import {
  getPageNumberFromBookmark,
  isValidReadingBookmarkFormat,
  parseReadingBookmark,
} from './bookmark';

describe('isValidReadingBookmarkFormat', () => {
  it('accepts valid formats', () => {
    expect(isValidReadingBookmarkFormat(null)).toBe(true);
    expect(isValidReadingBookmarkFormat('ayah:1:5')).toBe(true);
    expect(isValidReadingBookmarkFormat('page:42')).toBe(true);
  });
  it('rejects invalid formats', () => {
    expect(isValidReadingBookmarkFormat('ayah:abc:5')).toBe(false);
    expect(isValidReadingBookmarkFormat('page:')).toBe(false);
    expect(isValidReadingBookmarkFormat('verse:1:5')).toBe(false);
    expect(isValidReadingBookmarkFormat('ayah:1')).toBe(false);
  });
});

describe('getPageNumberFromBookmark', () => {
  it('returns number for page bookmark', () => {
    expect(getPageNumberFromBookmark('page:42')).toBe(42);
  });
  it('returns null for non-page formats', () => {
    expect(getPageNumberFromBookmark('ayah:1:5')).toBeNull();
    expect(getPageNumberFromBookmark('page:abc')).toBeNull();
    expect(getPageNumberFromBookmark(undefined)).toBeNull();
  });
});

describe('parseReadingBookmark - ayah', () => {
  it('parses ayah bookmark', () => {
    const result = parseReadingBookmark('ayah:2:255');
    expect(result.surahNumber).toBe(2);
    expect(result.verseNumber).toBe(255);
    expect(result.pageNumber).toBeUndefined();
  });
});

describe('parseReadingBookmark - page', () => {
  it('parses page bookmark when verses available', () => {
    const pageVersesData: any = { verses: [{ chapterId: 76, verseNumber: 1 }] };
    const result = parseReadingBookmark('page:578', pageVersesData);
    expect(result.surahNumber).toBe(76);
    expect(result.verseNumber).toBe(1);
    expect(result.pageNumber).toBe(578);
  });
  it('returns nulls when page verses not loaded', () => {
    const result = parseReadingBookmark('page:10', null);
    expect(result.surahNumber).toBeNull();
    expect(result.verseNumber).toBeNull();
  });
});

describe('parseReadingBookmark - fallback', () => {
  it('falls back to recently read when missing bookmark', () => {
    const result = parseReadingBookmark(null, null, [{ surah: '3', ayah: '18' }]);
    expect(result.surahNumber).toBe(3);
    expect(result.verseNumber).toBe(18);
  });
  it('defaults on invalid format', () => {
    const result = parseReadingBookmark('invalid');
    expect(result.surahNumber).toBe(1);
    expect(result.verseNumber).toBeNull();
  });
  it('handles numeric recently read values', () => {
    const result = parseReadingBookmark(null, null, [{ surah: 4, ayah: 5 }]);
    expect(result.surahNumber).toBe(4);
    expect(result.verseNumber).toBe(5);
  });
  it('handles missing ayah in recently read', () => {
    const result = parseReadingBookmark(null, null, [{ surah: '7' }]);
    expect(result.surahNumber).toBe(7);
    expect(result.verseNumber).toBeNull();
  });
  it('handles no recently read fallback', () => {
    const result = parseReadingBookmark(null, null, []);
    expect(result.surahNumber).toBe(1);
    expect(result.verseNumber).toBeNull();
  });
});

describe('edge cases', () => {
  it('accepts page:0 as valid and extracts 0', () => {
    expect(isValidReadingBookmarkFormat('page:0')).toBe(true);
    expect(getPageNumberFromBookmark('page:0')).toBe(0);
  });
  it('rejects whitespace in bookmark', () => {
    expect(isValidReadingBookmarkFormat(' page:1')).toBe(false);
    expect(getPageNumberFromBookmark(' page:1')).toBeNull();
  });
  it('page verses with string numbers convert correctly', () => {
    const pageVersesData: any = { verses: [{ chapterId: '9', verseNumber: '2' }] };
    const result = parseReadingBookmark('page:100', pageVersesData);
    expect(result.surahNumber).toBe(9);
    expect(result.verseNumber).toBe(2);
    expect(result.pageNumber).toBe(100);
  });
});

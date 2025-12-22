import { describe, it, expect } from 'vitest';

import {
  isValidReadingBookmarkFormat,
  parseReadingBookmark,
  parsePageReadingBookmark,
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

describe('parseReadingBookmark - ayah', () => {
  it('parses ayah bookmark', () => {
    const result = parseReadingBookmark('ayah:2:255');
    expect(result.surahNumber).toBe(2);
    expect(result.verseNumber).toBe(255);
    expect(result.pageNumber).toBeUndefined();
  });
});

describe('parseReadingBookmark - page', () => {
  it('parses extended page bookmark', () => {
    const result = parseReadingBookmark('page:578:76:1');
    expect(result.surahNumber).toBe(76);
    expect(result.verseNumber).toBe(1);
    expect(result.pageNumber).toBe(578);
  });
  it('returns nulls for simple page format', () => {
    const result = parseReadingBookmark('page:10');
    expect(result.surahNumber).toBeNull();
    expect(result.verseNumber).toBeNull();
  });
});

describe('parseReadingBookmark - fallback', () => {
  it('falls back to recently read when missing bookmark', () => {
    const result = parseReadingBookmark(null, [{ surah: '3', ayah: '18' }]);
    expect(result.surahNumber).toBe(3);
    expect(result.verseNumber).toBe(18);
  });
  it('defaults on invalid format', () => {
    const result = parseReadingBookmark('invalid');
    expect(result.surahNumber).toBe(1);
    expect(result.verseNumber).toBeNull();
  });
  it('handles numeric recently read values', () => {
    const result = parseReadingBookmark(null, [{ surah: 4, ayah: 5 }]);
    expect(result.surahNumber).toBe(4);
    expect(result.verseNumber).toBe(5);
  });
  it('handles missing ayah in recently read', () => {
    const result = parseReadingBookmark(null, [{ surah: '7' }]);
    expect(result.surahNumber).toBe(7);
    expect(result.verseNumber).toBeNull();
  });
  it('handles no recently read fallback', () => {
    const result = parseReadingBookmark(null, []);
    expect(result.surahNumber).toBe(1);
    expect(result.verseNumber).toBeNull();
  });
});

describe('edge cases', () => {
  it('rejects whitespace in bookmark', () => {
    expect(isValidReadingBookmarkFormat(' page:1')).toBe(false);
  });
  it('extended page with string numbers convert correctly', () => {
    const result = parseReadingBookmark('page:100:9:2');
    expect(result.surahNumber).toBe(9);
    expect(result.verseNumber).toBe(2);
    expect(result.pageNumber).toBe(100);
  });
});

describe('parsePageReadingBookmark', () => {
  it('parses extended page bookmark to numbers', () => {
    const r = parsePageReadingBookmark('page:10:2:255') as any;
    expect(r.pageNumber).toBe(10);
    expect(r.surahNumber).toBe(2);
    expect(r.verseNumber).toBe(255);
  });

  it('returns null for simple page format', () => {
    expect(parsePageReadingBookmark('page:10')).toBeNull();
  });

  it('returns null for wrong type', () => {
    expect(parsePageReadingBookmark('ayah:2:255')).toBeNull();
  });

  it('returns null for wrong parts length', () => {
    expect(parsePageReadingBookmark('page:10:2')).toBeNull();
  });

  it('returns null for non-string input', () => {
    expect(parsePageReadingBookmark('')).toBeNull();
  });
});

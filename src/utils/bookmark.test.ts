import { describe, it, expect } from 'vitest';

import { isValidReadingBookmarkFormat, parsePageReadingBookmark } from './bookmark';

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

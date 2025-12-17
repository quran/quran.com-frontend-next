import { describe, expect, it } from 'vitest';

import {
  getPageNumberFromBookmark,
  isValidReadingBookmarkFormat,
  parseReadingBookmark,
} from './bookmark';

import { VersesResponse } from '@/types/ApiResponses';

describe('isValidReadingBookmarkFormat', () => {
  it('returns true for valid formats and null', () => {
    expect(isValidReadingBookmarkFormat(null)).toBe(true);
    expect(isValidReadingBookmarkFormat('ayah:1:1')).toBe(true);
    expect(isValidReadingBookmarkFormat('page:42')).toBe(true);
  });

  it('extracts page number from page bookmarks', () => {
    expect(isValidReadingBookmarkFormat('ayah:abc:1')).toBe(false);
    expect(isValidReadingBookmarkFormat('page:x')).toBe(false);
    expect(isValidReadingBookmarkFormat('verse:1:1')).toBe(false);
    expect(isValidReadingBookmarkFormat('AYAH:1:1')).toBe(false);
    expect(isValidReadingBookmarkFormat('page:0001')).toBe(true);
  });
});

describe('getPageNumberFromBookmark', () => {
  it('returns number for page bookmarks, null otherwise', () => {
    expect(getPageNumberFromBookmark('page:42')).toBe(42);
    expect(getPageNumberFromBookmark('ayah:1:1')).toBeNull();
    expect(getPageNumberFromBookmark(null)).toBeNull();
    expect(getPageNumberFromBookmark('page:0007')).toBe(7);
  });
});

describe('parseReadingBookmark (ayah)', () => {
  it('parses ayah bookmark', () => {
    const result = parseReadingBookmark('ayah:2:5', null, null);
    expect(result.surahNumber).toBe(2);
    expect(result.verseNumber).toBe(5);
  });
});

describe('parseReadingBookmark (page)', () => {
  it('parses page bookmark using page verses data', () => {
    const pageVersesData: VersesResponse = {
      pagination: {
        perPage: 1,
        currentPage: 1,
        nextPage: null,
        totalRecords: 1,
        totalPages: 1,
      },
      verses: [
        {
          id: 1,
          chapterId: 5,
          verseNumber: 7,
          textUthmani: '',
          words: [],
        } as any,
      ],
    };
    const result = parseReadingBookmark('page:42', pageVersesData, null);
    expect(result.surahNumber).toBe(5);
    expect(result.verseNumber).toBe(7);
  });

  it('returns nulls when page verses not loaded', () => {
    const result = parseReadingBookmark('page:42', null, null);
    expect(result.surahNumber).toBeNull();
    expect(result.verseNumber).toBeNull();
  });
});

describe('parseReadingBookmark (fallbacks)', () => {
  it('falls back to recently read verses', () => {
    const result = parseReadingBookmark(null, null, [{ surah: 10, ayah: 3 }]);
    expect(result.surahNumber).toBe(10);
    expect(result.verseNumber).toBe(3);
  });

  it('defaults to surah 1 when invalid bookmark', () => {
    const result = parseReadingBookmark('invalid', null, null);
    expect(result.surahNumber).toBe(1);
    expect(result.verseNumber).toBeNull();
  });

  it('returns nulls for page bookmark when verses data missing', () => {
    const result = parseReadingBookmark('page:3', undefined, [{ surah: 2, ayah: 255 }]);
    expect(result.surahNumber).toBeNull();
    expect(result.verseNumber).toBeNull();
  });
});

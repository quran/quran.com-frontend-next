import { describe, expect, it } from 'vitest';

import { isElevatedBackgroundRoutePathname, isQuranReaderRoutePathname } from './routes';

describe('isQuranReaderRoutePathname', () => {
  it('returns true for quran reader paths', () => {
    expect(isQuranReaderRoutePathname('/[chapterId]')).toBe(true);
    expect(isQuranReaderRoutePathname('/[chapterId]/[verseId]')).toBe(true);
    expect(isQuranReaderRoutePathname('/[chapterId]/answers/[questionId]')).toBe(true);
    expect(isQuranReaderRoutePathname('/surah/[chapterId]/[...info]')).toBe(true);
    expect(isQuranReaderRoutePathname('/juz/[juzId]')).toBe(true);
  });

  it('returns false for non-reader paths', () => {
    expect(isQuranReaderRoutePathname('/')).toBe(false);
    expect(isQuranReaderRoutePathname('/about-us')).toBe(false);
    expect(isQuranReaderRoutePathname('/support')).toBe(false);
  });
});

describe('isElevatedBackgroundRoutePathname', () => {
  it('returns true for quran reader paths', () => {
    expect(isElevatedBackgroundRoutePathname('/[chapterId]')).toBe(true);
    expect(isElevatedBackgroundRoutePathname('/juz/[juzId]')).toBe(true);
  });

  it('returns true for collection paths', () => {
    expect(isElevatedBackgroundRoutePathname('/collections/all')).toBe(true);
    expect(isElevatedBackgroundRoutePathname('/collections/[collectionId]')).toBe(true);
  });

  it('returns false for non-elevated paths', () => {
    expect(isElevatedBackgroundRoutePathname('/')).toBe(false);
    expect(isElevatedBackgroundRoutePathname('/about-us')).toBe(false);
  });
});

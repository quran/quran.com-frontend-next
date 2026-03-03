import { describe, expect, it } from 'vitest';

import { isQuranReaderRoutePathname } from './routes';

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

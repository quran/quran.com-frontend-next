import { describe, expect, it } from 'vitest';

import { shouldSyncChapterPageForDataType } from '../quranReader';

import { QuranReaderDataType } from '@/types/QuranReader';

describe('shouldSyncChapterPageForDataType', () => {
  it('disables sync for Page view', () => {
    expect(shouldSyncChapterPageForDataType(QuranReaderDataType.Page)).toBe(false);
  });

  it('enables sync for Chapter view', () => {
    expect(shouldSyncChapterPageForDataType(QuranReaderDataType.Chapter)).toBe(true);
  });

  it('enables sync for Juz view', () => {
    expect(shouldSyncChapterPageForDataType(QuranReaderDataType.Juz)).toBe(true);
  });
});

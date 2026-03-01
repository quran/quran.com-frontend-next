import { describe, expect, it } from 'vitest';

import {
  getReaderBannerAnalyticsParams,
  getReaderBannerAnalyticsSource,
} from './fundraisingAnalytics';

import { QuranReaderDataType } from '@/types/QuranReader';

describe('getReaderBannerAnalyticsSource', () => {
  it('returns source per reader data type', () => {
    expect(getReaderBannerAnalyticsSource(QuranReaderDataType.Chapter)).toBe(
      'quran_reader_chapter_floating_banner',
    );
    expect(getReaderBannerAnalyticsSource(QuranReaderDataType.Page)).toBe(
      'quran_reader_page_floating_banner',
    );
    expect(getReaderBannerAnalyticsSource(QuranReaderDataType.Juz)).toBe(
      'quran_reader_juz_floating_banner',
    );
  });
});

describe('getReaderBannerAnalyticsParams', () => {
  it('maps numeric id params for numeric reader routes', () => {
    expect(getReaderBannerAnalyticsParams(QuranReaderDataType.Chapter, '2')).toEqual({
      chapterId: 2,
    });
    expect(getReaderBannerAnalyticsParams(QuranReaderDataType.Page, '9')).toEqual({
      pageNumber: 9,
    });
    expect(getReaderBannerAnalyticsParams(QuranReaderDataType.Hizb, '3')).toEqual({
      hizbNumber: 3,
    });
  });

  it('maps verse key params for range-like routes', () => {
    expect(
      getReaderBannerAnalyticsParams(QuranReaderDataType.Ranges, 'unused', {
        verseKey: '2:255',
      } as any),
    ).toEqual({ verseKey: '2:255' });
  });
});

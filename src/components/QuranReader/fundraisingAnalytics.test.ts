/* eslint-disable react-func/max-lines-per-function */
import { describe, expect, it } from 'vitest';

import {
  getReaderBannerAnalyticsParams,
  getReaderBannerAnalyticsSource,
  ReaderFundraisingBannerPlacement,
} from './fundraisingAnalytics';

import { QuranReaderDataType } from '@/types/QuranReader';

describe('getReaderBannerAnalyticsSource', () => {
  it('returns end-of-scroll source per reader data type by default', () => {
    expect(getReaderBannerAnalyticsSource(QuranReaderDataType.Chapter)).toBe(
      'quran_reader_chapter_end_of_scroll_banner',
    );
    expect(getReaderBannerAnalyticsSource(QuranReaderDataType.Page)).toBe(
      'quran_reader_page_end_of_scroll_banner',
    );
    expect(getReaderBannerAnalyticsSource(QuranReaderDataType.Juz)).toBe(
      'quran_reader_juz_end_of_scroll_banner',
    );
  });

  it('returns floating source variants when explicitly requested', () => {
    expect(
      getReaderBannerAnalyticsSource(
        QuranReaderDataType.Rub,
        ReaderFundraisingBannerPlacement.Floating,
      ),
    ).toBe('quran_reader_rub_floating_banner');
    expect(
      getReaderBannerAnalyticsSource(
        QuranReaderDataType.Ranges,
        ReaderFundraisingBannerPlacement.Floating,
      ),
    ).toBe('quran_reader_range_floating_banner');
  });

  it('maps range-like reader types to the shared range source', () => {
    expect(getReaderBannerAnalyticsSource(QuranReaderDataType.Verse)).toBe(
      'quran_reader_range_end_of_scroll_banner',
    );
    expect(getReaderBannerAnalyticsSource(QuranReaderDataType.ChapterVerseRanges)).toBe(
      'quran_reader_range_end_of_scroll_banner',
    );
    expect(getReaderBannerAnalyticsSource(QuranReaderDataType.Ranges)).toBe(
      'quran_reader_range_end_of_scroll_banner',
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

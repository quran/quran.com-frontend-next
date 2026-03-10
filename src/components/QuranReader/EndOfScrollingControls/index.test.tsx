import React from 'react';

import { cleanup, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import EndOfScrollingControls from '.';

import { QuranReaderDataType } from '@/types/QuranReader';

vi.mock('react-redux', () => ({
  useSelector: (selector: (state: any) => any) => selector((globalThis as any).mockReduxState),
}));

vi.mock('../RevelationOrderNavigationNotice', () => ({
  default: () => <div data-testid="revelation-order-notice" />,
  RevelationOrderNavigationNoticeView: {
    EndOfScrollingControls: 'EndOfScrollingControls',
  },
}));

vi.mock('./ChapterControls', () => ({
  default: () => <div data-testid="chapter-controls" />,
}));

vi.mock('./VerseControls', () => ({
  default: () => <div data-testid="verse-controls" />,
}));

vi.mock('./PageControls', () => ({
  default: () => <div data-testid="page-controls" />,
}));

vi.mock('./JuzControls', () => ({
  default: () => <div data-testid="juz-controls" />,
}));

vi.mock('./RubControls', () => ({
  default: () => <div data-testid="rub-controls" />,
}));

vi.mock('./HizbControls', () => ({
  default: () => <div data-testid="hizb-controls" />,
}));

vi.mock('@/components/Fundraising/HomepageFundraisingBanner', () => ({
  __esModule: true,
  default: ({
    analyticsSource,
    analyticsParams,
  }: {
    analyticsSource: string;
    analyticsParams: Record<string, unknown>;
  }) => (
    <div
      data-testid="fundraising-banner"
      data-analytics-source={analyticsSource}
      data-analytics-params={JSON.stringify(analyticsParams)}
    />
  ),
  FundraisingBannerContext: {
    QuranReader: 'quranReader',
  },
}));

describe('EndOfScrollingControls', () => {
  const initialData = {
    verses: [{ verseKey: '2:255' }],
    pagesLookup: {
      lookupRange: {
        to: '2:286',
      },
    },
  } as any;

  beforeEach(() => {
    cleanup();
    (globalThis as any).mockReduxState = {
      revelationOrder: {
        isReadingByRevelationOrder: false,
      },
    };
  });

  it.each([
    [
      QuranReaderDataType.Chapter,
      '2',
      'quran_reader_chapter_end_of_scroll_banner',
      { chapterId: 2 },
    ],
    [
      QuranReaderDataType.Verse,
      '2:255',
      'quran_reader_range_end_of_scroll_banner',
      { verseKey: '2:255' },
    ],
    [QuranReaderDataType.Page, '9', 'quran_reader_page_end_of_scroll_banner', { pageNumber: 9 }],
    [QuranReaderDataType.Juz, '30', 'quran_reader_juz_end_of_scroll_banner', { juzNumber: 30 }],
    [QuranReaderDataType.Hizb, '4', 'quran_reader_hizb_end_of_scroll_banner', { hizbNumber: 4 }],
    [QuranReaderDataType.Rub, '7', 'quran_reader_rub_end_of_scroll_banner', { rubNumber: 7 }],
    [
      QuranReaderDataType.ChapterVerseRanges,
      '2:255-2:257',
      'quran_reader_range_end_of_scroll_banner',
      { verseKey: '2:255' },
    ],
  ])(
    'renders the fundraising banner for %s routes with the right analytics props',
    (quranReaderDataType, resourceId, analyticsSource, analyticsParams) => {
      render(
        <EndOfScrollingControls
          quranReaderDataType={quranReaderDataType as QuranReaderDataType}
          resourceId={resourceId}
          lastVerse={{ verseKey: '2:286' } as any}
          initialData={initialData}
        />,
      );

      const banner = screen.getByTestId('fundraising-banner');
      expect(banner.getAttribute('data-analytics-source')).toBe(analyticsSource);
      expect(JSON.parse(banner.getAttribute('data-analytics-params')!)).toEqual(analyticsParams);
    },
  );
});

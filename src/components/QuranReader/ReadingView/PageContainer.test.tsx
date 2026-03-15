import React from 'react';

import { cleanup, render, screen } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import PageContainer from './PageContainer';

import { MushafLines, QuranFont, ReadingPreference } from '@/types/QuranReader';

const mockUseSWRImmutable = vi.fn();
const mockUseIsUsingDefaultSettings = vi.fn();

vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
}));

vi.mock('swr/immutable', () => ({
  default: (...args: unknown[]) => mockUseSWRImmutable(...args),
}));

vi.mock('../utils/page', () => ({
  getPageNumberByPageIndex: vi.fn(() => 1),
}));

vi.mock('./Page', () => ({
  default: ({ verses }: { verses: unknown[] }) => <div data-testid="page">{verses.length}</div>,
}));

vi.mock('./ReadingViewSkeleton', () => ({
  default: () => <div data-testid="reading-view-skeleton" />,
}));

vi.mock('@/components/QuranReader/api', () => ({
  getReaderViewRequestKey: vi.fn(() => '/mocked-reader-request-key'),
  verseFetcher: vi.fn(),
}));

vi.mock('@/hooks/auth/useIsLoggedIn', () => ({
  default: () => ({
    isLoggedIn: false,
  }),
}));

vi.mock('@/hooks/useIsUsingDefaultSettings', () => ({
  default: (...args: unknown[]) => mockUseIsUsingDefaultSettings(...args),
}));

vi.mock('@/redux/defaultSettings/util', () => ({
  getTranslationsInitialState: vi.fn(() => ({
    selectedTranslations: [131],
  })),
}));

vi.mock('@/redux/slices/persistGateHydration', () => ({
  selectIsPersistGateHydrationComplete: (state: any) => state.persistGateHydration,
}));

vi.mock('@/redux/slices/QuranReader/readingPreferences', () => ({
  selectValidatedReadingTranslation: (state: any) =>
    state.readingPreferences.selectedReadingTranslation,
}));

vi.mock('@/redux/slices/QuranReader/translations', () => ({
  selectSelectedTranslations: (state: any) => state.translations.selectedTranslations,
}));

const quranReaderStyles = {
  quranFont: QuranFont.TajweedV4,
  mushafLines: MushafLines.SixteenLines,
  quranTextFontScale: 3,
  translationFontScale: 3,
} as any;

const initialVerses = [
  {
    id: 1,
    chapterId: 2,
    verseNumber: 1,
    verseKey: '2:1',
    pageNumber: 1,
    words: [{ pageNumber: 1 }],
  },
];

const makeProps = () => ({
  pagesVersesRange: {
    1: {
      from: '2:1',
      to: '2:5',
      firstVerseKey: '2:1',
      lastVerseKey: '2:5',
    },
  },
  quranReaderStyles,
  reciterId: 7,
  lang: 'en',
  wordByWordLocale: 'en',
  pageIndex: 0,
  setMushafPageToVersesMap: vi.fn(),
  initialData: {
    verses: initialVerses,
    pagination: {
      perPage: 5,
    },
  } as any,
  readingPreference: ReadingPreference.Reading,
});

const renderPageContainer = () => render(<PageContainer {...makeProps()} />);

const expectSWRFallback = (fallbackData: unknown, revalidateOnMount: boolean) => {
  expect(mockUseSWRImmutable).toHaveBeenCalledWith(
    '/mocked-reader-request-key',
    expect.any(Function),
    expect.objectContaining({
      fallbackData,
      revalidateOnMount,
    }),
  );
};

const primeSelectors = () => {
  const mockState = {
    persistGateHydration: true,
    readingPreferences: {
      selectedReadingTranslation: 131,
    },
    translations: {
      selectedTranslations: [131],
    },
  };

  vi.mocked(useSelector).mockImplementation((selector: any) => selector(mockState));
};

describe('PageContainer', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    primeSelectors();
    mockUseSWRImmutable.mockReturnValue({
      data: undefined,
    });
  });

  it('shows the page skeleton for first-page non-default settings', () => {
    mockUseIsUsingDefaultSettings.mockReturnValue(false);

    renderPageContainer();

    expectSWRFallback(undefined, true);
    expect(screen.getByTestId('reading-view-skeleton')).not.toBeNull();
    expect(screen.queryByTestId('page')).toBeNull();
  });

  it('reuses SSR verses only when first-page settings still match the defaults', () => {
    mockUseIsUsingDefaultSettings.mockReturnValue(true);

    renderPageContainer();

    expectSWRFallback(initialVerses, false);
    expect(screen.getByTestId('page').textContent).toBe('1');
    expect(screen.queryByTestId('reading-view-skeleton')).toBeNull();
  });
});

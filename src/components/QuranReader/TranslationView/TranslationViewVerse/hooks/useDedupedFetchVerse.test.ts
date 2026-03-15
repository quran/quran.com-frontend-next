import { renderHook } from '@testing-library/react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import useDedupedFetchVerse from './useDedupedFetchVerse';

import { Mushaf, MushafLines, QuranFont, QuranReaderDataType } from '@/types/QuranReader';

const mockUseSWRImmutable = vi.fn();
const mockUseIsUsingDefaultSettings = vi.fn();

vi.mock('next/router', () => ({
  useRouter: vi.fn(),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    lang: 'en',
  }),
}));

vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
}));

vi.mock('swr/immutable', () => ({
  default: (...args: unknown[]) => mockUseSWRImmutable(...args),
}));

vi.mock('@/components/QuranReader/api', () => ({
  getTranslationViewRequestKey: vi.fn(() => '/mocked-request-key'),
  verseFetcher: vi.fn(),
}));

vi.mock('@/hooks/useIsUsingDefaultSettings', () => ({
  default: (...args: unknown[]) => mockUseIsUsingDefaultSettings(...args),
}));

vi.mock('@/utils/auth/apiPaths', () => ({
  makeBookmarksRangeUrl: vi.fn(() => '/mocked-bookmarks-range'),
}));

vi.mock('@/utils/auth/login', () => ({
  isLoggedIn: vi.fn(() => false),
}));

const initialVerses = [
  {
    id: 1,
    verseKey: '2:1',
    chapterId: 2,
    verseNumber: 1,
    pageNumber: 1,
    hizbNumber: 1,
    words: [],
    translations: [],
  },
  {
    id: 2,
    verseKey: '2:2',
    chapterId: 2,
    verseNumber: 2,
    pageNumber: 1,
    hizbNumber: 1,
    words: [],
    translations: [],
  },
];

const initialData = {
  verses: initialVerses,
  pagination: {
    perPage: 2,
  },
} as any;

const quranReaderStyles = {
  quranFont: QuranFont.TajweedV4,
  mushafLines: MushafLines.SixteenLines,
  quranTextFontScale: 3,
  translationFontScale: 3,
} as any;

const makeHookParams = () => ({
  quranReaderDataType: QuranReaderDataType.Chapter,
  quranReaderStyles,
  wordByWordLocale: 'en',
  reciterId: 7,
  resourceId: 2,
  selectedTranslations: [131],
  initialData,
  setApiPageToVersesMap: vi.fn(),
  mushafId: Mushaf.QCFTajweedV4,
  verseIdx: 0,
});

const renderUseDedupedFetchVerse = () => renderHook(() => useDedupedFetchVerse(makeHookParams()));

const expectSWRFallback = (fallbackData: unknown, revalidateOnMount: boolean) => {
  expect(mockUseSWRImmutable).toHaveBeenCalledWith(
    '/mocked-request-key',
    expect.any(Function),
    expect.objectContaining({
      fallbackData,
      revalidateOnMount,
    }),
  );
};

const primeHookDefaults = () => {
  vi.clearAllMocks();

  vi.mocked(useRouter).mockReturnValue({
    query: {
      translations: '131',
    },
  } as any);

  vi.mocked(useSelector).mockReturnValue(true as never);
  mockUseSWRImmutable.mockReturnValue({
    data: undefined,
  });
};

describe('useDedupedFetchVerse', () => {
  beforeEach(primeHookDefaults);

  it('keeps the first verse empty for non-default settings so the skeleton can render', () => {
    mockUseIsUsingDefaultSettings.mockReturnValue(false);

    const { result } = renderUseDedupedFetchVerse();

    expectSWRFallback(undefined, true);
    expect(result.current.verse).toBeNull();
  });

  it('reuses SSR verses only when the current reader settings are still the defaults', () => {
    mockUseIsUsingDefaultSettings.mockReturnValue(true);

    const { result } = renderUseDedupedFetchVerse();

    expectSWRFallback(initialVerses, false);
    expect(result.current.verse).toEqual(initialVerses[0]);
  });
});

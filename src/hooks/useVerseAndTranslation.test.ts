/* eslint-disable react-func/max-lines-per-function */
import { renderHook } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import useVerseAndTranslation from './useVerseAndTranslation';

import { makeVersesUrl } from '@/utils/apiPaths';

const mockUseSWR = vi.fn();
const mockUseQcfFont = vi.fn();

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    lang: 'en',
  }),
}));

vi.mock('react-redux', async () => {
  const actual = await vi.importActual<typeof import('react-redux')>('react-redux');

  return {
    ...actual,
    useSelector: vi.fn(),
  };
});

vi.mock('swr/immutable', () => ({
  default: (...args: unknown[]) => mockUseSWR(...args),
}));

vi.mock('@/hooks/useQcfFont', () => ({
  default: (...args: unknown[]) => mockUseQcfFont(...args),
}));

vi.mock('@/redux/slices/QuranReader/translations', () => ({
  selectSelectedTranslations: vi.fn(),
}));

vi.mock('@/redux/slices/QuranReader/styles', () => ({
  selectQuranReaderStyles: vi.fn(),
}));

vi.mock('@/utils/api', () => ({
  getDefaultWordFields: vi.fn(() => ({ words: true })),
  getMushafId: vi.fn(() => ({ mushaf: 4 })),
}));

vi.mock('@/utils/apiPaths', () => ({
  makeVersesUrl: vi.fn(() => '/mocked-verses-url'),
}));

const mockQuranReaderStyles = {
  quranFont: 'qpc-hafs',
  mushafLines: 15,
  translationFontScale: 3,
  quranTextFontScale: 3,
};

const primeSelectors = () => {
  vi.mocked(useSelector)
    .mockReturnValueOnce([131] as never)
    .mockReturnValueOnce(mockQuranReaderStyles as never);
};

const renderUseVerseAndTranslation = (translationIds?: Array<number | string>) =>
  renderHook(() =>
    useVerseAndTranslation({
      chapter: 2,
      from: 261,
      to: 261,
      translationIds,
    }),
  );

const expectTranslationsParam = (translations: string) => {
  expect(makeVersesUrl).toHaveBeenCalledWith(
    2,
    'en',
    expect.objectContaining({
      translations,
    }),
  );
};

describe('useVerseAndTranslation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      mutate: vi.fn(),
    });
    primeSelectors();
  });

  it('falls back to Redux-selected translations when translationIds is not provided', () => {
    const { result } = renderUseVerseAndTranslation();

    expect(result.current.translations).toEqual([131]);
    expectTranslationsParam('131');
  });

  it('respects an explicitly provided empty translationIds array', () => {
    vi.mocked(useSelector).mockReset();
    primeSelectors();

    const { result } = renderUseVerseAndTranslation([]);

    expect(result.current.translations).toEqual([]);
    expectTranslationsParam('');
  });
});

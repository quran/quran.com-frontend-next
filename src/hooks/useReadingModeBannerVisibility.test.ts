/* eslint-disable react-func/max-lines-per-function */
import { renderHook } from '@testing-library/react';
import { useRouter } from 'next/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import useReadingModeBannerVisibility from './useReadingModeBannerVisibility';

import { didUserSwitchReadingMode } from '@/hooks/readingModeSwitchTracker';
import useGetQueryParamOrReduxValue from '@/hooks/useGetQueryParamOrReduxValue';
import QueryParam from '@/types/QueryParam';
import { ReadingPreference } from '@/types/QuranReader';

vi.mock('next/router', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/hooks/readingModeSwitchTracker', () => ({
  didUserSwitchReadingMode: vi.fn(),
}));

vi.mock('@/hooks/useGetQueryParamOrReduxValue', () => ({
  default: vi.fn(),
}));

describe('useReadingModeBannerVisibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useRouter).mockReturnValue({
      asPath: '/2/255?readingMode=translation',
      isReady: true,
    } as any);

    vi.mocked(useGetQueryParamOrReduxValue).mockImplementation((queryParam: QueryParam) => {
      if (queryParam === QueryParam.READING_MODE) {
        return {
          value: ReadingPreference.ReadingTranslation,
          isQueryParamDifferent: true,
        };
      }

      return {
        value: undefined,
        isQueryParamDifferent: false,
      };
    });

    vi.mocked(didUserSwitchReadingMode).mockReturnValue(false);
  });

  it('returns true when readingMode query param is different and user did not switch mode manually', () => {
    const { result } = renderHook(() => useReadingModeBannerVisibility());

    expect(result.current).toBe(true);
    expect(didUserSwitchReadingMode).toHaveBeenCalledWith('/2/255?readingMode=translation');
  });

  it('returns false when readingMode query param is not different', () => {
    vi.mocked(useGetQueryParamOrReduxValue).mockReturnValue({
      value: ReadingPreference.Reading,
      isQueryParamDifferent: false,
    });

    const { result } = renderHook(() => useReadingModeBannerVisibility());

    expect(result.current).toBe(false);
  });

  it('returns false before router is ready to avoid refresh/navigation flicker', () => {
    vi.mocked(useRouter).mockReturnValue({
      asPath: '/2/255?readingMode=translation',
      isReady: false,
    } as any);

    const { result } = renderHook(() => useReadingModeBannerVisibility());

    expect(result.current).toBe(false);
  });

  it('returns false when user switch tracker is active for the same path', () => {
    vi.mocked(didUserSwitchReadingMode).mockReturnValue(true);

    const { result } = renderHook(() => useReadingModeBannerVisibility());

    expect(result.current).toBe(false);
  });
});

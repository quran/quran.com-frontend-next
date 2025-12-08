/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { renderHook } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import useGetRecentlyReadVerseKeys from '@/hooks/auth/useGetRecentlyReadVerseKeys';
import useGetContinueReadingUrl from '@/hooks/useGetContinueReadingUrl';
import { selectLastReadVerseKey } from '@/redux/slices/QuranReader/readingTracker';
import { getChapterWithStartingVerseUrl } from '@/utils/navigation';

// Mock dependencies
vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
}));

vi.mock('@/hooks/auth/useGetRecentlyReadVerseKeys');
vi.mock('@/utils/navigation', () => ({
  getChapterWithStartingVerseUrl: vi.fn((verseKey: string) => `/mocked-url/${verseKey}`),
}));

describe('useGetContinueReadingUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return URL from most recent reading session when available (priority 1)', () => {
    // Mock most recent reading session
    const mockRecentlyReadVerseKeys = [
      { surah: '2', ayah: '5' },
      { surah: '3', ayah: '10' },
    ];

    vi.mocked(useGetRecentlyReadVerseKeys).mockReturnValue({
      recentlyReadVerseKeys: mockRecentlyReadVerseKeys,
      isLoading: false,
    });

    // Mock Redux selector to return null (should not be used)
    vi.mocked(useSelector).mockImplementation((selector) => {
      if (selector === selectLastReadVerseKey) {
        return { verseKey: null };
      }
      return null;
    });

    const { result } = renderHook(() => useGetContinueReadingUrl());

    expect(result.current).toBe('/mocked-url/2:5');
    expect(getChapterWithStartingVerseUrl).toHaveBeenCalledWith('2:5');
    expect(getChapterWithStartingVerseUrl).toHaveBeenCalledTimes(1);
  });

  it('should fallback to Redux lastReadVerse when no recent reading session (priority 2)', () => {
    // Mock no recent reading sessions
    vi.mocked(useGetRecentlyReadVerseKeys).mockReturnValue({
      recentlyReadVerseKeys: [],
      isLoading: false,
    });

    // Mock Redux selector to return lastReadVerse
    const mockLastReadVerse = {
      verseKey: '3:15',
      chapterId: '3',
      page: '50',
      hizb: '2',
    };

    vi.mocked(useSelector).mockImplementation((selector) => {
      if (selector === selectLastReadVerseKey) {
        return mockLastReadVerse;
      }
      return null;
    });

    const { result } = renderHook(() => useGetContinueReadingUrl());

    expect(result.current).toBe('/mocked-url/3:15');
    expect(getChapterWithStartingVerseUrl).toHaveBeenCalledWith('3:15');
    expect(getChapterWithStartingVerseUrl).toHaveBeenCalledTimes(1);
  });

  it('should default to first surah when no recent session and no Redux value (priority 3)', () => {
    // Mock no recent reading sessions
    vi.mocked(useGetRecentlyReadVerseKeys).mockReturnValue({
      recentlyReadVerseKeys: [],
      isLoading: false,
    });

    // Mock Redux selector to return null/undefined verseKey
    vi.mocked(useSelector).mockImplementation((selector) => {
      if (selector === selectLastReadVerseKey) {
        return { verseKey: null };
      }
      return null;
    });

    const { result } = renderHook(() => useGetContinueReadingUrl());

    expect(result.current).toBe('/mocked-url/1:1');
    expect(getChapterWithStartingVerseUrl).toHaveBeenCalledWith('1:1');
    expect(getChapterWithStartingVerseUrl).toHaveBeenCalledTimes(1);
  });

  it('should prioritize most recent reading session over Redux value', () => {
    // Mock most recent reading session
    const mockRecentlyReadVerseKeys = [{ surah: '5', ayah: '20' }];

    vi.mocked(useGetRecentlyReadVerseKeys).mockReturnValue({
      recentlyReadVerseKeys: mockRecentlyReadVerseKeys,
      isLoading: false,
    });

    // Mock Redux selector to return a value (should be ignored)
    const mockLastReadVerse = {
      verseKey: '4:10',
      chapterId: '4',
      page: '80',
      hizb: '3',
    };

    vi.mocked(useSelector).mockImplementation((selector) => {
      if (selector === selectLastReadVerseKey) {
        return mockLastReadVerse;
      }
      return null;
    });

    const { result } = renderHook(() => useGetContinueReadingUrl());

    // Should use most recent reading session, not Redux value
    expect(result.current).toBe('/mocked-url/5:20');
    expect(getChapterWithStartingVerseUrl).toHaveBeenCalledWith('5:20');
    expect(getChapterWithStartingVerseUrl).not.toHaveBeenCalledWith('4:10');
  });

  it('should handle empty array for recentlyReadVerseKeys', () => {
    // Mock empty array (not null/undefined)
    vi.mocked(useGetRecentlyReadVerseKeys).mockReturnValue({
      recentlyReadVerseKeys: [],
      isLoading: false,
    });

    // Mock Redux selector to return null
    vi.mocked(useSelector).mockImplementation((selector) => {
      if (selector === selectLastReadVerseKey) {
        return { verseKey: null };
      }
      return null;
    });

    const { result } = renderHook(() => useGetContinueReadingUrl());

    expect(result.current).toBe('/mocked-url/1:1');
    expect(getChapterWithStartingVerseUrl).toHaveBeenCalledWith('1:1');
  });

  it('should handle undefined recentlyReadVerseKeys', () => {
    // Mock undefined recentlyReadVerseKeys
    vi.mocked(useGetRecentlyReadVerseKeys).mockReturnValue({
      recentlyReadVerseKeys: undefined,
      isLoading: false,
    });

    // Mock Redux selector to return null
    vi.mocked(useSelector).mockImplementation((selector) => {
      if (selector === selectLastReadVerseKey) {
        return { verseKey: null };
      }
      return null;
    });

    const { result } = renderHook(() => useGetContinueReadingUrl());

    expect(result.current).toBe('/mocked-url/1:1');
    expect(getChapterWithStartingVerseUrl).toHaveBeenCalledWith('1:1');
  });
});

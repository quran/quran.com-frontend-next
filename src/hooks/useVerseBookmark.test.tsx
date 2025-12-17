import { configureStore } from '@reduxjs/toolkit';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, it, expect, vi } from 'vitest';

import { useVerseBookmark } from './useVerseBookmark';

import { isLoggedIn } from '@/utils/auth/login';

vi.mock('@/redux/slices/QuranReader/styles', () => ({
  selectQuranReaderStyles: () => ({ quranFont: 'code_v1', mushafLines: 'code_v1' }),
}));

vi.mock('@/utils/api', () => ({
  getMushafId: () => ({ mushaf: 1 }),
}));

vi.mock('@/utils/auth/login', () => ({
  isLoggedIn: vi.fn(() => true),
}));

vi.mock('@/utils/auth/api', () => ({
  getBookmark: vi.fn(async () => ({
    id: 'b1',
    key: 1,
    type: 'ayah',
    verseNumber: 1,
  })),
}));

vi.mock('@/lib/newrelic', () => ({
  logError: vi.fn(),
}));

describe('useVerseBookmark', () => {
  const makeStore = () =>
    configureStore({
      reducer: (state = {}) => state as any,
    });

  it('returns bookmarked state when API succeeds', async () => {
    const store = makeStore();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const verse = { chapterId: 1, verseNumber: 1 } as any;
    const { result } = renderHook(() => useVerseBookmark(verse), { wrapper });
    expect(result.current.isLoading).toBe(true);
    await vi.waitFor(() => {
      expect(result.current.isVerseBookmarked).toBe(true);
      expect(result.current.bookmark?.id).toBe('b1');
    });
  });

  it('returns not bookmarked when logged out', async () => {
    vi.mocked(isLoggedIn).mockReturnValue(false);
    const store = makeStore();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const verse = { chapterId: 1, verseNumber: 1 } as any;
    const { result } = renderHook(() => useVerseBookmark(verse), { wrapper });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isVerseBookmarked).toBe(false);
    expect(result.current.bookmark).toBeUndefined();
  });

  it('handles API error and logs error, returns undefined bookmark', async () => {
    const store = makeStore();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const verse = { chapterId: 1, verseNumber: 2 } as any;

    const { getBookmark } = await import('@/utils/auth/api');
    vi.mocked(getBookmark).mockRejectedValueOnce(new Error('network'));

    const { result } = renderHook(() => useVerseBookmark(verse), { wrapper });
    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isVerseBookmarked).toBe(false);
      expect(result.current.bookmark).toBeUndefined();
    });
  });
});

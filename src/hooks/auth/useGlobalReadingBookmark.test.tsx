/* eslint-disable react-func/max-lines-per-function */
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import useGlobalReadingBookmark, { READING_BOOKMARK_KEY } from './useGlobalReadingBookmark';

import { useAuthContext } from '@/contexts/AuthContext';
import Bookmark from '@/types/Bookmark';
import BookmarkType from '@/types/BookmarkType';
import * as authApi from '@/utils/auth/api';
import * as loginUtils from '@/utils/auth/login';

// Mock dependencies
vi.mock('@/utils/auth/api', () => ({
  getReadingBookmark: vi.fn(),
}));

vi.mock('@/utils/auth/login', () => ({
  isLoggedIn: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: vi.fn(),
}));

describe('useGlobalReadingBookmark', () => {
  const mockGetReadingBookmark = vi.mocked(authApi.getReadingBookmark);
  const mockIsLoggedIn = vi.mocked(loginUtils.isLoggedIn);
  const mockUseAuthContext = vi.mocked(useAuthContext);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthContext.mockReturnValue({
      state: {
        user: { id: 'test-user-123' },
        accessToken: 'test-token',
        refreshToken: 'test-refresh-token',
        expiryDate: new Date(Date.now() + 3600000).toISOString(),
      },
    } as unknown as ReturnType<typeof useAuthContext>);
  });

  it('generates consistent cache keys', () => {
    expect(READING_BOOKMARK_KEY(1)).toBe('reading-bookmark-1');
    expect(READING_BOOKMARK_KEY(2)).toBe('reading-bookmark-2');
    expect(READING_BOOKMARK_KEY(1, 'user-123')).toBe('reading-bookmark-user-123-1');
    expect(READING_BOOKMARK_KEY(2, 'user-456')).toBe('reading-bookmark-user-456-2');
  });

  it('returns null bookmark when not logged in', () => {
    mockIsLoggedIn.mockReturnValue(false);

    const { result } = renderHook(() => useGlobalReadingBookmark(1));

    expect(result.current.readingBookmark).toBeNull();
    expect(mockGetReadingBookmark).not.toHaveBeenCalled();
  });

  it('returns null bookmark when user is not available in auth state', () => {
    mockUseAuthContext.mockReturnValue({
      state: {
        user: null,
        accessToken: null,
        refreshToken: null,
        expiryDate: null,
      },
    } as unknown as ReturnType<typeof useAuthContext>);
    mockIsLoggedIn.mockReturnValue(true);

    const { result } = renderHook(() => useGlobalReadingBookmark(1));

    expect(result.current.readingBookmark).toBeNull();
    expect(mockGetReadingBookmark).not.toHaveBeenCalled();
  });

  it('fetches reading bookmark when logged in', async () => {
    mockIsLoggedIn.mockReturnValue(true);
    mockGetReadingBookmark.mockResolvedValue({
      id: 'bm-1',
      key: 1,
      verseNumber: 1,
      type: BookmarkType.Ayah,
      isReading: true,
    } as Bookmark);

    const { result } = renderHook(() => useGlobalReadingBookmark(1));

    await waitFor(() => {
      expect(result.current.readingBookmark).not.toBeNull();
    });

    expect(result.current.readingBookmark).toEqual({
      id: 'bm-1',
      key: 1,
      verseNumber: 1,
      type: 'ayah',
      isReading: true,
    });
  });

  it('exposes mutate function for cache updates', () => {
    mockIsLoggedIn.mockReturnValue(true);
    mockGetReadingBookmark.mockResolvedValue(null);

    const { result } = renderHook(() => useGlobalReadingBookmark(1));

    expect(typeof result.current.mutate).toBe('function');
  });
});

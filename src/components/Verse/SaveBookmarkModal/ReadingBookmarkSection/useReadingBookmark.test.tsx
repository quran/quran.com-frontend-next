/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import React from 'react';

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';

import useReadingBookmark from './useReadingBookmark';

import { ReadingBookmarkType } from '@/types/Bookmark';
import BookmarkType from '@/types/BookmarkType';
import * as authApi from '@/utils/auth/api';

// Mock dependencies
vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (k: string) => k }),
}));

vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: vi.fn((selector: any) => {
    // Return mock data based on selector
    if (typeof selector === 'function') {
      const mockState = {
        quranReaderStyles: { quranFont: 'code_v1', mushafLines: 15 },
        guestBookmark: { readingBookmark: null },
      };
      return selector(mockState);
    }
    return null;
  }),
}));

vi.mock('@/contexts/DataContext', () => ({
  default: React.createContext({
    1: { transliteratedName: 'Al-Fatihah' },
    2: { transliteratedName: 'Al-Baqarah' },
  }),
}));

vi.mock('@/redux/slices/QuranReader/styles', () => ({
  selectQuranReaderStyles: (state: any) => state.quranReaderStyles,
}));

vi.mock('@/redux/slices/guestBookmark', () => ({
  selectGuestReadingBookmark: (state: any) => state.guestBookmark?.readingBookmark || null,
  setGuestReadingBookmark: vi.fn((payload) => ({ type: 'SET_GUEST_READING_BOOKMARK', payload })),
}));

vi.mock('@/hooks/useMappedBookmark', () => ({
  default: () => ({
    needsMapping: false,
    effectivePageNumber: null,
    effectiveAyahVerseKey: null,
    isLoading: false,
  }),
}));

vi.mock('@/utils/api', () => ({
  getMushafId: () => ({ mushaf: 1 }),
}));

vi.mock('@/utils/auth/api', () => ({
  addBookmark: vi.fn(),
  deleteBookmarkById: vi.fn(),
}));

vi.mock('@/utils/chapter', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  getChapterData: (_data: any, chapterId: string) => ({
    transliteratedName: chapterId === '1' ? 'Al-Fatihah' : 'Al-Baqarah',
  }),
}));

vi.mock('@/utils/locale', () => ({
  toLocalizedNumber: (n: number) => String(n),
  toLocalizedVerseKey: (key: string) => key,
  toLocalizedVerseKeyRTL: (key: string) => key,
  isRTLLocale: (lang: string) => lang === 'ar',
}));

describe('useReadingBookmark - Logged-in User', () => {
  const mockOnBookmarkChanged = vi.fn();
  const mockAddBookmark = authApi.addBookmark as Mock;
  const mockDeleteBookmark = authApi.deleteBookmarkById as Mock;
  const mockDeleteBookmarkById = authApi.deleteBookmarkById as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAddBookmark.mockResolvedValue({
      id: 'bookmark-123',
      key: 1,
      verseNumber: 1,
      type: BookmarkType.Ayah,
    });
    mockDeleteBookmarkById.mockResolvedValue(undefined);
  });

  describe('isCurrentBookmark detection', () => {
    it('returns true when readingBookmarkData matches current verse', () => {
      const { result } = renderHook(() =>
        useReadingBookmark({
          type: ReadingBookmarkType.AYAH,
          verseKey: '1:1',
          lang: 'en',
          isLoggedIn: true,
          mushafId: 1,
          readingBookmarkData: {
            id: 'bm-1',
            key: 1,
            verseNumber: 1,
            type: BookmarkType.Ayah,
          },
        }),
      );

      expect(result.current.isCurrentBookmark).toBe(true);
    });

    it('returns false when readingBookmarkData does not match current verse', () => {
      const { result } = renderHook(() =>
        useReadingBookmark({
          type: ReadingBookmarkType.AYAH,
          verseKey: '1:1',
          lang: 'en',
          isLoggedIn: true,
          mushafId: 1,
          readingBookmarkData: {
            id: 'bm-1',
            key: 2,
            verseNumber: 255,
            type: BookmarkType.Ayah,
          },
        }),
      );

      expect(result.current.isCurrentBookmark).toBe(false);
    });

    it('returns false when no readingBookmarkData exists', () => {
      const { result } = renderHook(() =>
        useReadingBookmark({
          type: ReadingBookmarkType.AYAH,
          verseKey: '1:1',
          lang: 'en',
          isLoggedIn: true,
          mushafId: 1,
          readingBookmarkData: null,
        }),
      );

      expect(result.current.isCurrentBookmark).toBe(false);
    });

    it('returns true when readingBookmarkData matches current page', () => {
      const { result } = renderHook(() =>
        useReadingBookmark({
          type: ReadingBookmarkType.PAGE,
          pageNumber: 42,
          lang: 'en',
          isLoggedIn: true,
          mushafId: 1,
          readingBookmarkData: {
            id: 'bm-1',
            key: 42,
            type: BookmarkType.Page,
          },
        }),
      );

      expect(result.current.isCurrentBookmark).toBe(true);
    });
  });

  describe('handleSetReadingBookmark', () => {
    it('calls addBookmark with isReading: true for verse', async () => {
      const { result } = renderHook(() =>
        useReadingBookmark({
          type: ReadingBookmarkType.AYAH,
          verseKey: '2:255',
          lang: 'en',
          isLoggedIn: true,
          mushafId: 1,
          onBookmarkChanged: mockOnBookmarkChanged,
        }),
      );

      await act(async () => {
        await result.current.handleSetReadingBookmark();
      });

      expect(mockAddBookmark).toHaveBeenCalledWith({
        key: 2,
        mushafId: 1,
        type: BookmarkType.Ayah,
        verseNumber: 255,
        isReading: true,
      });
      // Note: onBookmarkChanged is NOT called for logged-in users (optimistic updates instead)
      expect(mockOnBookmarkChanged).not.toHaveBeenCalled();
    });

    it('calls addBookmark with isReading: true for page', async () => {
      const { result } = renderHook(() =>
        useReadingBookmark({
          type: ReadingBookmarkType.PAGE,
          pageNumber: 42,
          lang: 'en',
          isLoggedIn: true,
          mushafId: 1,
          onBookmarkChanged: mockOnBookmarkChanged,
        }),
      );

      await act(async () => {
        await result.current.handleSetReadingBookmark();
      });

      expect(mockAddBookmark).toHaveBeenCalledWith({
        key: 42,
        mushafId: 1,
        type: BookmarkType.Page,
        isReading: true,
      });
    });
  });

  describe('handleRemoveCurrentBookmark', () => {
    it('calls addBookmark with isReading: null to unset verse bookmark', async () => {
      const readingBookmarkData = {
        id: 'bm-1',
        key: 1,
        verseNumber: 1,
        type: BookmarkType.Ayah,
      };

      const { result } = renderHook(() =>
        useReadingBookmark({
          type: ReadingBookmarkType.AYAH,
          verseKey: '1:1',
          lang: 'en',
          isLoggedIn: true,
          mushafId: 1,
          readingBookmarkData,
          onBookmarkChanged: mockOnBookmarkChanged,
        }),
      );

      // Verify it's detected as current bookmark
      expect(result.current.isCurrentBookmark).toBe(true);
      expect(result.current.showRemoveSection).toBe(true);

      await act(async () => {
        await result.current.handleRemoveCurrentBookmark();
      });

      expect(mockDeleteBookmark).toHaveBeenCalledWith('bm-1');
      // Note: onBookmarkChanged is NOT called for logged-in users (optimistic updates instead)
      expect(mockOnBookmarkChanged).not.toHaveBeenCalled();
    });

    it('calls addBookmark with isReading: null to unset page bookmark', async () => {
      const readingBookmarkData = {
        id: 'bm-1',
        key: 42,
        type: BookmarkType.Page,
      };

      const { result } = renderHook(() =>
        useReadingBookmark({
          type: ReadingBookmarkType.PAGE,
          pageNumber: 42,
          lang: 'en',
          isLoggedIn: true,
          mushafId: 1,
          readingBookmarkData,
          onBookmarkChanged: mockOnBookmarkChanged,
        }),
      );

      expect(result.current.isCurrentBookmark).toBe(true);

      await act(async () => {
        await result.current.handleRemoveCurrentBookmark();
      });

      expect(mockDeleteBookmark).toHaveBeenCalledWith('bm-1');
    });

    it('does nothing when no readingBookmarkData exists', async () => {
      const { result } = renderHook(() =>
        useReadingBookmark({
          type: ReadingBookmarkType.AYAH,
          verseKey: '1:1',
          lang: 'en',
          isLoggedIn: true,
          mushafId: 1,
          readingBookmarkData: null,
        }),
      );

      await act(async () => {
        await result.current.handleRemoveCurrentBookmark();
      });

      expect(mockDeleteBookmark).not.toHaveBeenCalled();
    });
  });

  describe('showRemoveSection', () => {
    it('is true when isCurrentBookmark and no pending undo', () => {
      const { result } = renderHook(() =>
        useReadingBookmark({
          type: ReadingBookmarkType.AYAH,
          verseKey: '1:1',
          lang: 'en',
          isLoggedIn: true,
          mushafId: 1,
          readingBookmarkData: {
            id: 'bm-1',
            key: 1,
            verseNumber: 1,
            type: BookmarkType.Ayah,
          },
        }),
      );

      expect(result.current.showRemoveSection).toBe(true);
    });

    it('is false when not current bookmark', () => {
      const { result } = renderHook(() =>
        useReadingBookmark({
          type: ReadingBookmarkType.AYAH,
          verseKey: '1:1',
          lang: 'en',
          isLoggedIn: true,
          mushafId: 1,
          readingBookmarkData: {
            id: 'bm-1',
            key: 2,
            verseNumber: 255,
            type: BookmarkType.Ayah,
          },
        }),
      );

      expect(result.current.showRemoveSection).toBe(false);
    });
  });
});

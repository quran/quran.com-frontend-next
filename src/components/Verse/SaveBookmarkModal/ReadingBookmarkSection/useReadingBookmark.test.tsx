/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import React from 'react';

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';

import useReadingBookmark from './useReadingBookmark';

import useMappedBookmark from '@/hooks/useMappedBookmark';
import { ReadingBookmarkType } from '@/types/Bookmark';
import BookmarkType from '@/types/BookmarkType';
import { getMushafId } from '@/utils/api';
import * as authApi from '@/utils/auth/api';

let mockReduxState = {
  quranReaderStyles: { quranFont: 'code_v1', mushafLines: 15 },
  guestBookmark: { readingBookmark: null },
};

// Mock dependencies
vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (k: string) => k }),
}));

vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: vi.fn((selector: any) => {
    if (typeof selector === 'function') {
      return selector(mockReduxState);
    }
    return selector;
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
  default: vi.fn((options?: { bookmark?: { type?: string; key?: number } }) => ({
    needsMapping: false,
    effectivePageNumber: options?.bookmark?.type === 'page' ? options.bookmark.key ?? null : null,
    effectiveAyahVerseKey: null,
    isLoading: false,
  })),
}));

vi.mock('@/utils/api', () => ({
  getMushafId: vi.fn(() => ({ mushaf: 1 })),
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
}));

describe('useReadingBookmark - Logged-in User', () => {
  const mockOnBookmarkChanged = vi.fn();
  const mockAddBookmark = authApi.addBookmark as Mock;
  const mockDeleteBookmark = authApi.deleteBookmarkById as Mock;
  const mockDeleteBookmarkById = authApi.deleteBookmarkById as Mock;
  const mockGetMushafId = getMushafId as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReduxState = {
      quranReaderStyles: { quranFont: 'code_v1', mushafLines: 15 },
      guestBookmark: { readingBookmark: null },
    };
    mockGetMushafId.mockReturnValue({ mushaf: 1 });
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

  describe('optimistic override behavior', () => {
    it('clears override once base bookmark data matches, then follows base changes', async () => {
      const initialProps = {
        type: ReadingBookmarkType.AYAH,
        verseKey: '2:255',
        lang: 'en',
        isLoggedIn: true,
        mushafId: 1,
        readingBookmarkData: null,
      };

      const { result, rerender } = renderHook((props) => useReadingBookmark(props), {
        initialProps,
      });

      await act(async () => {
        await result.current.handleSetReadingBookmark();
      });

      expect(result.current.displayReadingBookmark).toBe('Al-Baqarah 2:255');

      // Base data is stale/different -> optimistic override should still win
      rerender({
        ...initialProps,
        readingBookmarkData: {
          id: 'bm-old',
          key: 1,
          verseNumber: 1,
          type: BookmarkType.Ayah,
        },
      });
      expect(result.current.displayReadingBookmark).toBe('Al-Baqarah 2:255');

      // Base data catches up -> override should clear
      rerender({
        ...initialProps,
        readingBookmarkData: {
          id: 'bm-new',
          key: 2,
          verseNumber: 255,
          type: BookmarkType.Ayah,
        },
      });
      await act(async () => {});

      // After override clears, base changes should be reflected
      rerender({
        ...initialProps,
        readingBookmarkData: {
          id: 'bm-old',
          key: 1,
          verseNumber: 1,
          type: BookmarkType.Ayah,
        },
      });
      expect(result.current.displayReadingBookmark).toBe('Al-Fatihah 1:1');
    });
  });

  describe('showNewBookmark/previousBookmarkValue transitions', () => {
    it('sets previousBookmark on set and clears it on undo', async () => {
      vi.useFakeTimers();
      try {
        const { result } = renderHook(() =>
          useReadingBookmark({
            type: ReadingBookmarkType.AYAH,
            verseKey: '2:255',
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

        expect(result.current.showNewBookmark).toBe(false);
        expect(result.current.previousBookmarkValue).toBeUndefined();

        await act(async () => {
          await result.current.handleSetReadingBookmark();
        });

        expect(result.current.showNewBookmark).toBe(true);
        expect(result.current.previousBookmarkValue).toBe('Al-Fatihah 1:1');

        await act(async () => {
          await result.current.handleUndoReadingBookmark();
        });
        await act(async () => {
          vi.runAllTimers();
        });

        expect(result.current.showNewBookmark).toBe(false);
        expect(result.current.previousBookmarkValue).toBeUndefined();
      } finally {
        vi.useRealTimers();
      }
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

describe('useReadingBookmark - Guest User', () => {
  const mockUseMappedBookmark = useMappedBookmark as Mock;
  const mockGetMushafId = getMushafId as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReduxState = {
      quranReaderStyles: { quranFont: 'code_v1', mushafLines: 15 },
      guestBookmark: { readingBookmark: null },
    };
    mockGetMushafId.mockReturnValue({ mushaf: 1 });
  });

  it('keeps optimistic override when page key matches but mushafId differs', async () => {
    mockGetMushafId.mockReturnValue({ mushaf: 2 });
    mockReduxState = {
      quranReaderStyles: { quranFont: 'code_v1', mushafLines: 15 },
      guestBookmark: {
        readingBookmark: {
          key: 5,
          type: BookmarkType.Page,
          mushafId: 1,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      },
    };

    const { result } = renderHook(() =>
      useReadingBookmark({
        type: ReadingBookmarkType.PAGE,
        pageNumber: 5,
        lang: 'en',
      }),
    );

    await act(async () => {
      await result.current.handleSetReadingBookmark();
    });
    await act(async () => {});

    const lastCall = mockUseMappedBookmark.mock.calls[mockUseMappedBookmark.mock.calls.length - 1];
    const lastBookmark = lastCall?.[0]?.bookmark;
    expect(lastBookmark?.mushafId).toBe(2);
  });
});

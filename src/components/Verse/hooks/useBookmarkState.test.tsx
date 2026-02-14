import React from 'react';

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import useBookmarkState from './useBookmarkState';

import BookmarkType from '@/types/BookmarkType';
import { GuestReadingBookmark } from '@/utils/bookmark';

const Verse = { chapterId: '1', verseNumber: 1, verseKey: '1:1' } as any;

/**
 * Creates mock state for testing useBookmarkState hook.
 * @param {GuestReadingBookmark | null} readingBookmark - The guest reading bookmark as a structured object or null
 * @param {Record<string, number>} bookmarkedVerses - Map of verse keys to bookmark timestamps
 * @returns {any} Mock state object for testing
 */
const makeState = (
  readingBookmark: GuestReadingBookmark | null,
  bookmarkedVerses: Record<string, number>,
) => ({
  bookmarks: { bookmarkedVerses, bookmarkedPages: {} },
  quranReaderStyles: { quranFont: 'hafs', mushafLines: 15 },
  guestBookmark: { readingBookmark },
});

const mockCreatedAt = '2026-01-26T12:00:00.000Z';

// Default ayah bookmark for the default mock state
const defaultAyahBookmark: GuestReadingBookmark = {
  key: 1,
  type: BookmarkType.Ayah,
  verseNumber: 1,
  mushafId: 2,
  createdAt: mockCreatedAt,
};

vi.mock('react-redux', () => {
  const defaultState = {
    bookmarks: { bookmarkedVerses: { '1:1': Date.now() }, bookmarkedPages: {} },
    quranReaderStyles: { quranFont: 'hafs', mushafLines: 15 },
    guestBookmark: {
      readingBookmark: {
        key: 1,
        type: 'ayah',
        verseNumber: 1,
        mushafId: 2,
        createdAt: '2026-01-26T12:00:00.000Z',
      },
    },
  } as any;
  return {
    useSelector: (selector: (s: any) => any) =>
      selector((globalThis as any).mockStateRef?.current || defaultState),
    shallowEqual: () => null,
  };
});

vi.mock('swr', () => ({ default: () => ({ data: undefined, isValidating: false }) }));
vi.mock('swr/immutable', () => ({ default: () => ({ data: undefined, isValidating: false }) }));
vi.mock('@/utils/api', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return { ...actual, getMushafId: () => ({ mushaf: 2 }) };
});
vi.mock('@/utils/auth/login', () => ({ isLoggedIn: () => false }));
vi.mock('@/redux/slices/QuranReader/styles', () => ({
  selectQuranReaderStyles: (state: any) => state.quranReaderStyles,
}));
vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: () => ({
    state: {
      user: { id: 'test-user-123' },
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
      expiryDate: new Date(Date.now() + 3600000).toISOString(),
    },
  }),
}));

const Probe: React.FC = () => {
  const { isVerseBookmarked, isVerseReadingBookmark, isVerseBookmarkedLoading } =
    useBookmarkState(Verse);
  return (
    <div>
      <span data-testid="bookmarked">{String(isVerseBookmarked)}</span>
      <span data-testid="reading">{String(isVerseReadingBookmark)}</span>
      <span data-testid="loading">{String(isVerseBookmarkedLoading)}</span>
    </div>
  );
};

describe('useBookmarkState (guest)', () => {
  it('detects verse bookmarked and reading bookmark for ayah', () => {
    // Create proper structured reading bookmark for ayah 1:1
    (globalThis as any).mockStateRef = {
      current: makeState(defaultAyahBookmark, { '1:1': Date.now() }),
    };
    const { rerender } = render(<Probe />);
    expect(screen.getByTestId('bookmarked').textContent).toBe('true');
    expect(screen.getByTestId('reading').textContent).toBe('true');
    expect(screen.getByTestId('loading').textContent).toBe('false');

    // Create proper structured reading bookmark for page 1 (not matching ayah 1:1)
    const pageBookmark: GuestReadingBookmark = {
      key: 1,
      type: BookmarkType.Page,
      mushafId: 2,
      createdAt: mockCreatedAt,
    };

    (globalThis as any).mockStateRef = {
      current: makeState(pageBookmark, { '1:1': Date.now() }),
    };
    rerender(<Probe />);
    expect(screen.getByTestId('reading').textContent).toBe('false');
  });
});

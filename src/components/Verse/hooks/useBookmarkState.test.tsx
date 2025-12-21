import React from 'react';

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import useBookmarkState from './useBookmarkState';

const Verse = { chapterId: '1', verseNumber: 1, verseKey: '1:1' } as any;

const makeState = (readingBookmark: string | null, bookmarkedVerses: Record<string, number>) => ({
  bookmarks: { bookmarkedVerses, bookmarkedPages: {} },
  quranReaderStyles: { quranFont: 'hafs', mushafLines: 15 },
  guestBookmark: { readingBookmark },
});

vi.mock('react-redux', () => {
  const defaultState = {
    bookmarks: { bookmarkedVerses: { '1:1': Date.now() }, bookmarkedPages: {} },
    quranReaderStyles: { quranFont: 'hafs', mushafLines: 15 },
    guestBookmark: { readingBookmark: 'ayah:1:1' },
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
    (globalThis as any).mockStateRef = {
      current: makeState('ayah:1:1', { '1:1': Date.now() }),
    };
    const { rerender } = render(<Probe />);
    expect(screen.getByTestId('bookmarked').textContent).toBe('true');
    expect(screen.getByTestId('reading').textContent).toBe('true');
    expect(screen.getByTestId('loading').textContent).toBe('false');
    (globalThis as any).mockStateRef = {
      current: makeState('page:1', { '1:1': Date.now() }),
    };
    rerender(<Probe />);
    expect(screen.getByTestId('reading').textContent).toBe('false');
  });
});

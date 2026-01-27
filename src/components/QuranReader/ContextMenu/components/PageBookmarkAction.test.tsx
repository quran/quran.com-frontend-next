import React from 'react';

import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import PageBookmarkAction from './PageBookmarkAction';

import BookmarkType from '@/types/BookmarkType';

vi.mock('next/dynamic', () => ({ default: () => () => <div data-testid="modal" /> }));
vi.mock('next-translate/useTranslation', () => ({ default: () => ({ t: (k: string) => k }) }));
vi.mock('swr', () => ({ default: () => ({ data: undefined, isValidating: false }) }));
vi.mock('@/components/Verse/SaveBookmarkModal/SaveBookmarkModal', () => ({
  default: () => <div data-testid="modal" />,
  SaveBookmarkType: { PAGE: 'PAGE', AYAH: 'AYAH' },
}));
vi.mock('@/icons/bookmark-star.svg', () => ({ default: () => <div data-testid="star" /> }));
vi.mock('@/icons/unbookmarked.svg', () => ({ default: () => <div data-testid="unbookmarked" /> }));
vi.mock('@/utils/verse', () => ({
  getVersePageNumber: vi.fn(async () => {
    throw new Error('no');
  }),
}));
vi.mock('@/utils/auth/login', () => ({ isLoggedIn: () => false }));
vi.mock('@/hooks/auth/useGlobalReadingBookmark', () => ({
  default: () => ({ readingBookmark: null, isLoading: false }),
}));
vi.mock('@/hooks/useMappedBookmark', () => ({
  default: ({ bookmark }: any) => ({
    needsMapping: false,
    effectivePageNumber: bookmark?.key || null,
    effectiveAyahVerseKey: null,
    isLoading: false,
  }),
}));
vi.mock('@/redux/slices/QuranReader/styles', () => ({
  selectQuranReaderStyles: (s: any) => s.quranReaderStyles,
}));
vi.mock('react-redux', () => {
  const defaultState = {
    quranReaderStyles: { quranFont: 'hafs', mushafLines: 15 },
    guestBookmark: { readingBookmark: null },
  } as any;
  return {
    useSelector: (selector: (s: any) => any) =>
      selector((globalThis as any).mockPageState?.current || defaultState),
    shallowEqual: () => null,
  };
});

describe('PageBookmarkAction', () => {
  it('shows remove aria-label and star icon when current page is bookmarked', async () => {
    (globalThis as any).mockPageState = {
      current: {
        quranReaderStyles: { quranFont: 'hafs', mushafLines: 15 },
        guestBookmark: {
          readingBookmark: {
            key: 1,
            type: BookmarkType.Page,
            mushafId: 1,
            createdAt: new Date().toISOString(),
          },
        },
      },
    };
    render(<PageBookmarkAction pageNumber={1} />);
    const button = await screen.findByRole('button', { name: 'quran-reader:remove-bookmark' });
    expect(button.getAttribute('aria-label')).toBe('quran-reader:remove-bookmark');
    expect(await screen.findByTestId('star')).toBeDefined();
  });

  it('shows add aria-label and unbookmarked icon when page not bookmarked', () => {
    cleanup();
    (globalThis as any).mockPageState = {
      current: {
        quranReaderStyles: { quranFont: 'hafs', mushafLines: 15 },
        guestBookmark: {
          readingBookmark: {
            key: 2,
            type: BookmarkType.Page,
            mushafId: 1,
            createdAt: new Date().toISOString(),
          },
        },
      },
    };
    render(<PageBookmarkAction pageNumber={1} />);
    const buttons = screen.getAllByRole('button');
    const button = buttons[buttons.length - 1];
    expect(button.getAttribute('aria-label')).toBe('quran-reader:add-bookmark');
    expect(screen.getByTestId('unbookmarked')).toBeDefined();
  });
});

import React from 'react';

/* eslint-disable max-lines */
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import ReadingSection from './index';

import BookmarkType from '@/types/BookmarkType';

// mock swr before importing component under test
vi.mock('swr', () => ({
  default: (key: any) => {
    if (!key) return { data: undefined };
    if (typeof key === 'string' && key.startsWith('first-verse-')) {
      return { data: (globalThis as any).mockSWRFirstVerse };
    }
    if (typeof key === 'string' && key.startsWith('verse-to-page-')) {
      return { data: (globalThis as any).mockSWRPage };
    }
    if (typeof key === 'string' && key.startsWith('reading-bookmark')) {
      return { data: (globalThis as any).mockReadingBookmark };
    }
    return { data: undefined };
  },
}));

vi.mock('next-translate/useTranslation', () => ({ default: () => ({ t: (k: string) => k }) }));
vi.mock('@/components/Wrapper/Wrapper', () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('@/icons/bookmark_remove.svg', () => ({ default: () => <div /> }));
vi.mock('@/dls/Link/Link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
  LinkVariant: {},
}));
vi.mock('@/components/HomePage/ReadingSection/ChapterCard', () => ({
  default: ({ pageNumber, surahNumber, verseNumber }: any) => (
    <div
      data-testid="chapter-card"
      data-page-number={pageNumber ?? ''}
      data-surah={surahNumber}
      data-verse={verseNumber ?? ''}
    />
  ),
}));
vi.mock('@/components/HomePage/ReadingSection/NewCard', () => ({ default: () => <div /> }));
vi.mock('@/components/HomePage/ReadingSection/NoGoalOrStreakCard', () => ({
  default: () => <div />,
}));
vi.mock('@/components/HomePage/ReadingSection/StreakOrGoalCard', () => ({
  default: () => <div />,
}));
vi.mock('@/hooks/auth/useGetRecentlyReadVerseKeys', () => ({
  default: () => ({ recentlyReadVerseKeys: [] }),
}));
vi.mock('@/hooks/auth/useGetStreakWithMetadata', () => ({
  default: () => ({ goal: null, streak: null, currentActivityDay: null }),
}));
vi.mock('@/redux/slices/session', () => ({ selectUserState: (s: any) => s.session }));
vi.mock('@/redux/slices/QuranReader/styles', () => ({
  selectQuranReaderStyles: (s: any) => s.quranReaderStyles,
}));
vi.mock('react-redux', () => {
  const defaultState = {
    session: { isGuest: true, isFirstTimeGuest: false },
    quranReaderStyles: { quranFont: 'hafs', mushafLines: 15 },
    guestBookmark: { readingBookmark: 'page:2:1:1' },
  } as any;
  return {
    useSelector: (selector: (s: any) => any) =>
      selector((globalThis as any).mockState?.current || defaultState),
  };
});
vi.mock('@/utils/verse', () => ({
  getVersePageNumber: vi.fn(async () => 3),
  getPageFirstVerseKey: vi.fn(async () => ({ surahNumber: 2, verseNumber: 255 })),
}));
vi.mock('@/utils/auth/api', () => ({
  getReadingBookmark: vi.fn(async () => (globalThis as any).mockReadingBookmark),
}));
vi.mock('@/hooks/auth/useGlobalReadingBookmark', () => ({
  default: () => ({ readingBookmark: (globalThis as any).mockReadingBookmark }),
}));
vi.mock('@/hooks/useMappedBookmark', () => ({
  default: ({ bookmark }: any) => ({
    needsMapping: false,
    effectivePageNumber: bookmark?.type === 'page' ? bookmark?.key : null,
    effectiveAyahVerseKey:
      bookmark?.type === 'ayah'
        ? { surahNumber: bookmark?.key, verseNumber: bookmark?.verseNumber }
        : null,
    isLoading: false,
    bookmarkMushafId: bookmark?.mushafId || 1,
  }),
}));

describe('ReadingSection', () => {
  beforeEach(() => cleanup());

  it('renders ChapterCard with resolved page from extended bookmark', async () => {
    (globalThis as any).mockSWRFirstVerse = { surahNumber: 1, verseNumber: 1 };
    (globalThis as any).mockState = {
      current: {
        session: { isGuest: true, isFirstTimeGuest: false },
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
    render(<ReadingSection />);
    await waitFor(() => {
      const el = screen.getByTestId('chapter-card');
      expect(el.getAttribute('data-page-number')).toBe('2');
      expect(el.getAttribute('data-surah')).toBe('1');
      expect(el.getAttribute('data-verse')).toBe('1');
    });
  });

  it('renders ChapterCard linking to verse for ayah bookmark', async () => {
    (globalThis as any).mockState = {
      current: {
        session: { isGuest: true, isFirstTimeGuest: false },
        quranReaderStyles: { quranFont: 'hafs', mushafLines: 15 },
        guestBookmark: {
          readingBookmark: {
            key: 60,
            type: BookmarkType.Ayah,
            verseNumber: 3,
            mushafId: 1,
            createdAt: new Date().toISOString(),
          },
        },
      },
    };
    render(<ReadingSection />);
    await waitFor(() => {
      const el = screen.getByTestId('chapter-card');
      expect(el.getAttribute('data-page-number')).toBe('');
      expect(el.getAttribute('data-surah')).toBe('60');
      expect(el.getAttribute('data-verse')).toBe('3');
    });
  });

  it('uses logged-in user reading bookmark over guest bookmark', async () => {
    (globalThis as any).mockReadingBookmark = {
      key: 60,
      type: BookmarkType.Ayah,
      verseNumber: 3,
    };
    (globalThis as any).mockState = {
      current: {
        session: { isGuest: false, isFirstTimeGuest: false },
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
    render(<ReadingSection />);
    await waitFor(() => {
      const el = screen.getByTestId('chapter-card');
      expect(el.getAttribute('data-page-number')).toBe('');
      expect(el.getAttribute('data-surah')).toBe('60');
      expect(el.getAttribute('data-verse')).toBe('3');
    });
  });
});

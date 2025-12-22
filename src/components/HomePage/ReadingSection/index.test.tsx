import React from 'react';

import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import ReadingSection from './index';

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
    if (typeof key === 'string' && key.includes('preferences')) {
      return { data: (globalThis as any).mockUserPreferences };
    }
    return { data: undefined };
  },
}));

vi.mock('next-translate/useTranslation', () => ({ default: () => ({ t: (k: string) => k }) }));
vi.mock('@/icons/bookmark_remove.svg', () => ({ default: () => <div /> }));
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

describe('ReadingSection', () => {
  beforeEach(() => cleanup());

  it('renders ChapterCard with resolved page from extended bookmark', async () => {
    (globalThis as any).mockSWRPage = 3;
    render(<ReadingSection />);
    await waitFor(() =>
      expect(screen.getByTestId('chapter-card').getAttribute('data-page-number')).toBe('3'),
    );
  });

  it('renders ChapterCard linking to verse for ayah bookmark', async () => {
    (globalThis as any).mockSWRPage = 8;
    (globalThis as any).mockState = {
      current: {
        session: { isGuest: true, isFirstTimeGuest: false },
        quranReaderStyles: { quranFont: 'hafs', mushafLines: 15 },
        guestBookmark: { readingBookmark: 'ayah:60:3' },
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

  it('uses logged-in user preferences over guest bookmark', async () => {
    (globalThis as any).mockSWRPage = 9;
    (globalThis as any).mockUserPreferences = {
      readingBookmark: { bookmark: 'ayah:60:3' },
    };
    (globalThis as any).mockState = {
      current: {
        session: { isGuest: false, isFirstTimeGuest: false },
        quranReaderStyles: { quranFont: 'hafs', mushafLines: 15 },
        guestBookmark: { readingBookmark: 'page:2:1:1' },
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

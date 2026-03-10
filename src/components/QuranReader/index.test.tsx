import React from 'react';

import { cleanup, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import QuranReader from '.';

import { Mushaf, QuranReaderDataType, ReadingPreference } from '@/types/QuranReader';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    lang: 'en',
  }),
}));

vi.mock('react-redux', () => ({
  shallowEqual: vi.fn(),
  useSelector: (selector: (state: any) => any) => selector((globalThis as any).mockReduxState),
}));

vi.mock('@/redux/slices/QuranReader/contextMenu', () => ({
  selectIsExpanded: (state: any) => state.contextMenu.isExpanded,
}));

vi.mock('@/redux/slices/QuranReader/notes', () => ({
  selectNotes: (state: any) => state.notes,
}));

vi.mock('@/redux/slices/QuranReader/pinnedVerses', () => ({
  selectPinnedVerseKeys: (state: any) => state.pinnedVerses.verses,
}));

vi.mock('@/redux/slices/QuranReader/readingPreferences', () => ({
  selectReadingPreference: (state: any) => state.readingPreferences.readingPreference,
}));

vi.mock('@/redux/slices/QuranReader/sidebarNavigation', () => ({
  selectIsSidebarNavigationVisible: (state: any) => state.sidebarNavigation.isVisible,
}));

vi.mock('@/redux/slices/QuranReader/styles', () => ({
  selectQuranReaderStyles: (state: any) => state.quranReaderStyles,
  selectShowTajweedRules: (state: any) => state.quranReaderStyles.showTajweedRules,
}));

vi.mock('./ContextMenu', () => ({
  default: () => <div data-testid="context-menu" />,
}));

vi.mock('./contexts/VerseTrackerContext', () => ({
  VerseTrackerContextProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('./DebuggingObserverWindow', () => ({
  default: () => <div data-testid="debugging-observer" />,
}));

vi.mock('./hooks/useSyncChapterPage', () => ({
  default: vi.fn(),
}));

vi.mock('./Notes/Notes', () => ({
  default: () => <div data-testid="notes" />,
}));

vi.mock('./QuranReaderView', () => ({
  default: () => <div data-testid="quran-reader-view" />,
}));

vi.mock('./ReaderTopActions', () => ({
  default: () => <div data-testid="reader-top-actions" />,
}));

vi.mock('@/components/Fundraising/HomepageFundraisingBanner', () => ({
  default: () => <div data-testid="homepage-fundraising-banner" />,
}));

vi.mock('@/components/Fonts/FontPreLoader', () => ({
  default: () => <div data-testid="font-preloader" />,
}));

vi.mock('@/hooks/useGetMushaf', () => ({
  default: () => Mushaf.QCFV2,
}));

vi.mock('@/hooks/useIsMobile', () => ({
  default: () => false,
}));

describe('QuranReader', () => {
  beforeEach(() => {
    cleanup();
    (globalThis as any).mockReduxState = {
      notes: { isVisible: false },
      quranReaderStyles: {
        quranFont: 'hafs',
        mushafLines: 15,
        showTajweedRules: true,
      },
      sidebarNavigation: { isVisible: false },
      readingPreferences: { readingPreference: ReadingPreference.Reading },
      contextMenu: { isExpanded: true },
      pinnedVerses: { verses: [] },
    };
  });

  it('does not render the old floating fundraising banner from the reader shell', () => {
    render(
      <QuranReader
        initialData={{ verses: [{ verseKey: '2:255' }] } as any}
        id="2"
        quranReaderDataType={QuranReaderDataType.Chapter}
      />,
    );

    expect(screen.queryByTestId('homepage-fundraising-banner')).toBeNull();
    expect(screen.queryByTestId('quran-reader-view')).not.toBeNull();
  });
});

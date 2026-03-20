import React from 'react';

import { cleanup, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import EndOfScrollingControls from '.';

import { QuranReaderDataType } from '@/types/QuranReader';
import { VersesResponse } from 'types/ApiResponses';
import Verse from 'types/Verse';

vi.mock('react-redux', () => ({
  useSelector: (selector: (state: any) => any) => selector((globalThis as any).mockReduxState),
}));

vi.mock('../RevelationOrderNavigationNotice', () => ({
  default: () => <div data-testid="revelation-order-notice" />,
  RevelationOrderNavigationNoticeView: {
    EndOfScrollingControls: 'EndOfScrollingControls',
  },
}));

vi.mock('./ChapterControls', () => ({
  default: () => <div data-testid="chapter-controls" />,
}));

vi.mock('./VerseControls', () => ({
  default: () => <div data-testid="verse-controls" />,
}));

vi.mock('./PageControls', () => ({
  default: () => <div data-testid="page-controls" />,
}));

vi.mock('./JuzControls', () => ({
  default: () => <div data-testid="juz-controls" />,
}));

vi.mock('./RubControls', () => ({
  default: () => <div data-testid="rub-controls" />,
}));

vi.mock('./HizbControls', () => ({
  default: () => <div data-testid="hizb-controls" />,
}));

describe('EndOfScrollingControls', () => {
  const initialData = {
    verses: [{ verseKey: '2:255' }],
    pagesLookup: {
      lookupRange: {
        to: '2:286',
      },
    },
  } as unknown as VersesResponse;

  const lastVerse = { verseKey: '2:286' } as unknown as Verse;

  beforeEach(() => {
    cleanup();
    (globalThis as any).mockReduxState = {
      revelationOrder: {
        isReadingByRevelationOrder: false,
      },
    };
  });

  it('renders chapter controls for Chapter data type', () => {
    render(
      <EndOfScrollingControls
        quranReaderDataType={QuranReaderDataType.Chapter}
        lastVerse={lastVerse}
        initialData={initialData}
      />,
    );

    expect(screen.getByTestId('chapter-controls')).toBeTruthy();
  });

  it('renders verse controls for Verse data type', () => {
    render(
      <EndOfScrollingControls
        quranReaderDataType={QuranReaderDataType.Verse}
        lastVerse={lastVerse}
        initialData={initialData}
      />,
    );

    expect(screen.getByTestId('verse-controls')).toBeTruthy();
  });

  it('renders revelation order notice when reading by revelation order', () => {
    (globalThis as any).mockReduxState = {
      revelationOrder: {
        isReadingByRevelationOrder: true,
      },
    };

    render(
      <EndOfScrollingControls
        quranReaderDataType={QuranReaderDataType.Chapter}
        lastVerse={lastVerse}
        initialData={initialData}
      />,
    );

    expect(screen.getByTestId('revelation-order-notice')).toBeTruthy();
  });
});

/* eslint-disable i18next/no-literal-string */
import React from 'react';

import { render, screen, cleanup } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import CollectionVerseCell from './CollectionVerseCell';

import DataContext from 'src/contexts/DataContext';

let mockLang = 'en';

vi.mock('./CollectionVerseCellMenu', () => ({
  default: () => null,
}));

vi.mock('./VerseDisplay', () => ({
  default: () => null,
}));

vi.mock('@/icons/arrow.svg', () => ({
  default: () => null,
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key, lang: mockLang }),
}));

vi.mock('react-redux', () => ({
  useSelector: () => new Set(),
}));

vi.mock('@/hooks/usePinnedVerseSync', () => ({
  default: () => ({
    pinVerseWithSync: vi.fn(),
    unpinVerseWithSync: vi.fn(),
  }),
}));

vi.mock('@/dls/ConfirmationModal/hooks', () => ({
  useConfirm: () => vi.fn(async () => false),
}));

vi.mock('@/redux/slices/QuranReader/pinnedVerses', () => ({
  selectPinnedVerseKeysSet: () => new Set(),
}));

describe('CollectionVerseCell', () => {
  beforeEach(() => {
    cleanup();
    mockLang = 'en';
  });

  const chaptersData: any = {
    '1': {
      id: 1,
      transliteratedName: 'Al-Fatihah',
      nameArabic: 'الفاتحة',
      versesCount: 7,
      bismillahPre: true,
      revelationOrder: 5,
      revelationPlace: 'makkah',
      pages: [],
      nameComplex: '',
      nameSimple: '',
      translatedName: '',
      defaultSlug: '',
      slugs: [],
    },
  };

  it('shows Arabic surah name when lang is Urdu', async () => {
    mockLang = 'ur';
    render(
      <DataContext.Provider value={chaptersData}>
        <CollectionVerseCell
          bookmarkId="b1"
          chapterId={1}
          verseNumber={1}
          collectionId="c1"
          collectionName="Test"
          isOwner
        />
      </DataContext.Provider>,
    );

    expect(screen.getByRole('link').textContent).toContain('الفاتحة');
  });

  it('shows transliteration surah name when lang is English', async () => {
    mockLang = 'en';
    render(
      <DataContext.Provider value={chaptersData}>
        <CollectionVerseCell
          bookmarkId="b1"
          chapterId={1}
          verseNumber={1}
          collectionId="c1"
          collectionName="Test"
          isOwner
        />
      </DataContext.Provider>,
    );

    expect(screen.getByRole('link').textContent).toContain('Al-Fatihah');
  });
});

import React from 'react';

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import VerseAndTranslation from './VerseAndTranslation';

import DataContext from '@/contexts/DataContext';

let mockTranslationTextProps: Record<string, unknown> | null = null;

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    lang: 'ur',
  }),
}));

vi.mock('@/hooks/useVerseAndTranslation', () => ({
  default: () => ({
    data: {
      verses: [
        {
          verseKey: '2:261',
          chapterId: 2,
          verseNumber: 261,
          translations: [
            {
              id: 131,
              languageId: 38,
              text: 'Urdu translation',
            },
          ],
        },
      ],
    },
    error: null,
    mutate: vi.fn(),
    translationFontScale: 3,
    quranTextFontScale: 3,
  }),
}));

vi.mock('@/components/QuranReader/TranslationView/TranslationText', () => ({
  default: (props: Record<string, unknown>) => {
    mockTranslationTextProps = props;

    return <div data-testid="translation-text" />;
  },
}));

vi.mock('./PlainVerseText', () => ({
  default: () => <div data-testid="plain-verse-text" />,
}));

vi.mock('@/components/Error', () => ({
  default: () => <div data-testid="verse-error" />,
}));

vi.mock('@/dls/Spinner/Spinner', () => ({
  default: () => <div data-testid="verse-loading" />,
}));

vi.mock('@/utils/verse', () => ({
  getVerseWords: vi.fn(() => []),
}));

describe('VerseAndTranslation', () => {
  const chaptersData = {
    2: {
      transliteratedName: 'البقرة',
    },
  };

  beforeEach(() => {
    mockTranslationTextProps = null;
  });

  it('uses DataContext as the fallback source for localized chapter names', () => {
    render(
      <DataContext.Provider value={chaptersData}>
        <VerseAndTranslation chapter={2} from={261} to={261} shouldShowReference />
      </DataContext.Provider>,
    );

    expect(screen.getByTestId('translation-text')).not.toBeNull();
    expect(mockTranslationTextProps).toMatchObject({
      chapterName: 'البقرة',
      reference: '2:261',
      shouldShowReference: true,
    });
  });
});

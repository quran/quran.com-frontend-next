import React from 'react';

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import ReadingBookmarkSection from './ReadingBookmarkSection';

import { ReadingBookmarkType } from '@/types/Bookmark';

vi.mock('./useReadingBookmark', () => ({
  default: () => {
    const m = (globalThis as any).mockRbs || {
      isSelected: false,
      showRemoveSection: false,
      resourceDisplayName: 'Al-Fatihah 1:1',
      effectiveCurrentBookmark: null,
    };
    return {
      isLoading: false,
      error: null,
      isSelected: m.isSelected,
      showNewBookmark: !m.isSelected,
      showRemoveSection: m.showRemoveSection,
      resourceDisplayName: m.resourceDisplayName,
      displayReadingBookmark: m.resourceDisplayName,
      effectiveCurrentBookmark: m.effectiveCurrentBookmark,
      previousBookmarkValue: undefined,
      handleSetReadingBookmark: vi.fn(),
      handleUndoReadingBookmark: vi.fn(),
      handleRemoveCurrentBookmark: vi.fn(),
    };
  },
}));
vi.mock('@/icons/bookmark_blank.svg', () => ({ default: () => <div /> }));
vi.mock('@/icons/question-mark-rounded.svg', () => ({ default: () => <div /> }));
vi.mock('@/icons/bookmark-star.svg', () => ({ default: () => <div /> }));
vi.mock('@/icons/check.svg', () => ({ default: () => <div /> }));

describe('ReadingBookmarkSection', () => {
  it('renders set bookmark section when no current bookmark', () => {
    render(
      <ReadingBookmarkSection
        type={ReadingBookmarkType.AYAH}
        verseKey="1:1"
        readingBookmarkData={null}
        onBookmarkChanged={async () => {}}
        lang="en"
        isLoggedIn={false}
        mushafId={2}
        mutateReadingBookmark={async () => null}
      />,
    );
    expect(screen.getByText('set-as-reading-bookmark')).toBeDefined();
  });

  it('renders remove section when current bookmark is selected', async () => {
    (globalThis as any).mockRbs = {
      isSelected: true,
      showRemoveSection: true,
      resourceDisplayName: 'Al-Fatihah 1:1',
      effectiveCurrentBookmark: 'ayah:1:1',
    };

    render(
      <ReadingBookmarkSection
        type={ReadingBookmarkType.AYAH}
        verseKey="1:1"
        readingBookmarkData={{ id: 'ayah:1:1' } as any}
        onBookmarkChanged={async () => {}}
        lang="en"
        isLoggedIn={false}
        mushafId={2}
        mutateReadingBookmark={async () => null}
      />,
    );
    expect(screen.getByText('remove-my-reading-bookmark')).toBeDefined();
  });
});

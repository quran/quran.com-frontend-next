import React from 'react';

import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { ReadingBookmarkType } from '@/types/Bookmark';

vi.mock('./ReadingBookmarkSection', () => ({
  default: (props: any) => (
    <div
      data-testid="reading-bookmark-section"
      data-type={props.type}
      data-verse-key={props.verseKey}
      data-page-number={props.pageNumber}
      data-current-bookmark={props.currentReadingBookmark}
      data-is-logged-in={props.isLoggedIn}
    />
  ),
}));

vi.mock('./Collections/CollectionsList', () => ({
  default: (props: any) => (
    <div data-testid="collections-list" data-count={(props.collections || []).length} />
  ),
}));

vi.mock('./GuestSignInSection', () => ({
  default: () => <div data-testid="guest-sign-in-section" />,
}));

vi.mock('./SaveBookmarkModalHeader', () => ({
  default: (props: any) => <div data-testid="modal-header" data-title={props.title} />,
}));

vi.mock('./SaveBookmarkModalFooter', () => ({
  default: () => <div data-testid="modal-footer" />,
}));

describe('SaveBookmarkModalContent', () => {
  it('renders verse mode with collections for logged-in users', async () => {
    const { default: SaveBookmarkModalContent } = await import('./SaveBookmarkModalContent');
    render(
      <SaveBookmarkModalContent
        modalTitle="title"
        onClose={() => {}}
        isVerse
        isPage={false}
        verseKey="1:1"
        pageNumber={undefined}
        currentReadingBookmark={null}
        userIsLoggedIn
        mushafId={1}
        lang="en"
        onUpdateReadingBookmark={async () => {}}
        onReadingBookmarkChanged={async () => {}}
        sortedCollections={[{ id: 1, name: 'c1', isDefault: false }] as any}
        isDataReady
        isTogglingFavorites={false}
        onCollectionToggle={async () => {}}
        onNewCollectionClick={() => {}}
        onGuestSignIn={() => {}}
        onTakeNote={() => {}}
      />,
    );
    const rbs = screen.getByTestId('reading-bookmark-section');
    expect(rbs.getAttribute('data-type')).toBe(ReadingBookmarkType.AYAH);
    expect(rbs.getAttribute('data-verse-key')).toBe('1:1');
    expect(screen.getByTestId('collections-list')).toBeDefined();
    expect(screen.queryByTestId('guest-sign-in-section')).toBeNull();
  });

  it('renders page mode without collections and guest section hidden', async () => {
    cleanup();
    const { default: SaveBookmarkModalContent } = await import('./SaveBookmarkModalContent');
    render(
      <SaveBookmarkModalContent
        modalTitle="title"
        onClose={() => {}}
        isVerse={false}
        isPage
        verseKey=""
        pageNumber={42}
        currentReadingBookmark="page:42"
        userIsLoggedIn={false}
        mushafId={1}
        lang="en"
        onUpdateReadingBookmark={async () => {}}
        onReadingBookmarkChanged={async () => {}}
        sortedCollections={[]}
        isDataReady
        isTogglingFavorites={false}
        onCollectionToggle={async () => {}}
        onNewCollectionClick={() => {}}
        onGuestSignIn={() => {}}
        onTakeNote={() => {}}
      />,
    );
    const rbs = screen.getByTestId('reading-bookmark-section');
    expect(rbs.getAttribute('data-type')).toBe(ReadingBookmarkType.PAGE);
    expect(rbs.getAttribute('data-page-number')).toBe('42');
    expect(screen.queryByTestId('collections-list')).toBeNull();
    expect(screen.queryByTestId('guest-sign-in-section')).toBeNull();
  });

  it('renders guest section for verse when user is not logged in', async () => {
    const { default: SaveBookmarkModalContent } = await import('./SaveBookmarkModalContent');
    render(
      <SaveBookmarkModalContent
        modalTitle="title"
        onClose={() => {}}
        isVerse
        isPage={false}
        verseKey="9:2"
        pageNumber={undefined}
        currentReadingBookmark={null}
        userIsLoggedIn={false}
        mushafId={1}
        lang="en"
        onUpdateReadingBookmark={async () => {}}
        onReadingBookmarkChanged={async () => {}}
        sortedCollections={[]}
        isDataReady
        isTogglingFavorites={false}
        onCollectionToggle={async () => {}}
        onNewCollectionClick={() => {}}
        onGuestSignIn={() => {}}
        onTakeNote={() => {}}
      />,
    );
    expect(screen.getByTestId('guest-sign-in-section')).toBeDefined();
  });
});

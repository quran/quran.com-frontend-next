import React from 'react';

import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/components/dls/Spinner/Spinner', () => ({
  default: () => <div data-testid="spinner" />,
}));

vi.mock('@/icons/reading-bookmark-and-other.svg', () => ({
  default: () => <div data-testid="icon-reading-and-other" />,
}));
vi.mock('@/icons/bookmark-multiple.svg', () => ({
  default: () => <div data-testid="icon-multiple" />,
}));
vi.mock('@/icons/bookmark-star.svg', () => ({
  default: () => <div data-testid="icon-star" />,
}));
vi.mock('@/icons/bookmark_new.svg', () => ({
  default: () => <div data-testid="icon-new" />,
}));
vi.mock('@/icons/unbookmarked.svg', () => ({
  default: () => <div data-testid="icon-unbookmarked" />,
}));

vi.mock('@/dls/IconContainer/IconContainer', () => ({
  default: (props: any) => <div data-testid="icon-container" {...props} />,
  IconColor: { tertiary: 'tertiary' },
  IconSize: { Custom: 'Custom' },
}));

describe('BookmarkIcon', () => {
  it('renders spinner when loading', async () => {
    const { default: BookmarkIcon } = await import('./BookmarkIcon');
    render(
      <BookmarkIcon
        isLoading
        isBookmarked={false}
        isReadingBookmark={false}
        isCollectionBookmarked={false}
      />,
    );
    expect(screen.getByTestId('spinner')).toBeDefined();
  });

  it('renders combined icon when reading bookmark and other bookmark present', async () => {
    const { default: BookmarkIcon } = await import('./BookmarkIcon');
    render(
      <BookmarkIcon isLoading={false} isBookmarked isReadingBookmark isCollectionBookmarked />,
    );
    expect(screen.getByTestId('icon-reading-and-other')).toBeDefined();
  });

  it('renders multiple icon when bookmarked and in collection', async () => {
    const { default: BookmarkIcon } = await import('./BookmarkIcon');
    render(
      <BookmarkIcon
        isLoading={false}
        isBookmarked
        isReadingBookmark={false}
        isCollectionBookmarked
      />,
    );
    expect(screen.getByTestId('icon-multiple')).toBeDefined();
  });

  it('renders star icon when reading bookmark only', async () => {
    const { default: BookmarkIcon } = await import('./BookmarkIcon');
    render(<BookmarkIcon isLoading={false} isBookmarked={false} isReadingBookmark />);
    expect(screen.getByTestId('icon-star')).toBeDefined();
  });

  it('renders filled icon when bookmarked only', async () => {
    const { default: BookmarkIcon } = await import('./BookmarkIcon');
    render(<BookmarkIcon isLoading={false} isBookmarked isReadingBookmark={false} />);
    expect(screen.getByTestId('icon-new')).toBeDefined();
  });

  it('renders unbookmarked icon when no states active', async () => {
    const { default: BookmarkIcon } = await import('./BookmarkIcon');
    render(
      <BookmarkIcon
        isLoading={false}
        isBookmarked={false}
        isReadingBookmark={false}
        isCollectionBookmarked={false}
      />,
    );
    expect(screen.getByTestId('icon-container')).toBeDefined();
  });

  it('renders icon new when only collection is bookmarked', async () => {
    cleanup();
    const { default: BookmarkIcon } = await import('./BookmarkIcon');
    render(
      <BookmarkIcon
        isLoading={false}
        isBookmarked={false}
        isReadingBookmark={false}
        isCollectionBookmarked
      />,
    );
    expect(screen.getByTestId('icon-new')).toBeDefined();
  });

  it('unbookmarked icon container has correct props', async () => {
    cleanup();
    const { default: BookmarkIcon } = await import('./BookmarkIcon');
    render(
      <BookmarkIcon
        isLoading={false}
        isBookmarked={false}
        isReadingBookmark={false}
        isCollectionBookmarked={false}
      />,
    );
    const container = screen.getByTestId('icon-container');
    expect(container.getAttribute('color')).toBe('tertiary');
  });
});

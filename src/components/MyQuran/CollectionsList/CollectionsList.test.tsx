/* eslint-disable react-func/max-lines-per-function */
import React from 'react';

import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import CollectionsList from './index';

import { CollectionItem, CollectionSortOption } from '@/hooks/useCollections';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key, lang: 'en' }),
}));

vi.mock('next/router', () => ({
  useRouter: () => ({
    locale: 'en',
    pathname: '/',
    query: {},
    asPath: '/',
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

vi.mock('@/hooks/useDirection', () => ({
  default: () => 'ltr',
}));

vi.mock('react-virtuoso', () => ({
  Virtuoso: ({ totalCount, itemContent, style }: any) => (
    <div data-testid="virtuoso" data-total-count={totalCount} style={style}>
      {Array.from({ length: totalCount }, (unusedValue, index) => (
        <div key={index} data-testid={`virtuoso-item-${index}`}>
          {itemContent(index)}
        </div>
      ))}
    </div>
  ),
}));

vi.mock('@/dls/Sorter/Sorter', () => ({
  default: () => <div data-testid="collections-sorter" />,
  ArrowDirection: {
    Up: 'up',
    Down: 'down',
    Right: 'right',
    Left: 'left',
  },
}));

vi.mock('./CollectionsGuestPromo', () => ({
  default: () => <div data-testid="collections-guest-promo" />,
}));

vi.mock('./CollectionsListSkeleton', () => ({
  default: () => <div data-testid="collections-list-skeleton" />,
}));

vi.mock('./CollectionListItem', () => ({
  default: ({ collection, onClick }: any) => (
    <button type="button" onClick={() => onClick(collection)}>
      {collection.name}
    </button>
  ),
}));

vi.mock('@/icons/chevron-down.svg', () => ({ default: () => <div /> }));
vi.mock('@/icons/plus.svg', () => ({ default: () => <div /> }));
vi.mock('@/icons/bookmark_new.svg', () => ({ default: () => <div /> }));
vi.mock('@/icons/chevron-right.svg', () => ({ default: () => <div /> }));

const buildCollection = (overrides: Partial<CollectionItem>): CollectionItem => ({
  id: overrides.id || '1',
  name: overrides.name || 'Collection',
  updatedAt: overrides.updatedAt || '2025-01-01T00:00:00.000Z',
  isDefault: overrides.isDefault ?? false,
  itemCount: overrides.itemCount ?? 0,
});

const renderCollectionsList = (
  props: Partial<React.ComponentProps<typeof CollectionsList>> = {},
) => {
  const defaultProps: React.ComponentProps<typeof CollectionsList> = {
    collections: [],
    isLoading: false,
    isGuest: false,
    sortBy: CollectionSortOption.RECENTLY_UPDATED,
    onSortChange: vi.fn(),
  };
  return render(<CollectionsList {...defaultProps} {...props} />);
};

const getCollectionButtons = (names: string[]) => {
  const buttons = screen.getAllByRole('button');
  return buttons.filter((button) =>
    names.some((name) => button.textContent?.toLowerCase().includes(name.toLowerCase())),
  );
};

describe('CollectionsList', () => {
  beforeEach(() => cleanup());

  it('renders guest promo when user is guest', () => {
    renderCollectionsList({ isGuest: true });
    expect(screen.getByTestId('collections-guest-promo')).toBeDefined();
    expect(screen.queryByTestId('virtuoso')).toBeNull();
  });

  it('renders skeleton when loading', () => {
    renderCollectionsList({ isLoading: true, isGuest: false });
    expect(screen.getByTestId('collections-list-skeleton')).toBeDefined();
  });

  it('renders collections and handles item click', () => {
    const onCollectionClick = vi.fn();
    const collections = [
      buildCollection({ id: '1', name: 'Alpha' }),
      buildCollection({ id: '2', name: 'Beta' }),
    ];

    renderCollectionsList({ collections, onCollectionClick });

    const alphaButton = screen.getByRole('button', { name: 'Alpha' });
    fireEvent.click(alphaButton);

    expect(onCollectionClick).toHaveBeenCalledWith(collections[0]);
  });

  it('sorts collections alphabetically ascending', () => {
    const collections = [
      buildCollection({ id: '1', name: 'Beta' }),
      buildCollection({ id: '2', name: 'Alpha' }),
      buildCollection({ id: '3', name: 'Gamma' }),
    ];

    renderCollectionsList({
      collections,
      sortBy: CollectionSortOption.ALPHABETICAL_ASC,
    });

    const buttons = getCollectionButtons(['Alpha', 'Beta', 'Gamma']);
    const names = buttons.map((button) => button.textContent || '');
    expect(names[0]).toMatch(/Alpha/);
    expect(names[1]).toMatch(/Beta/);
    expect(names[2]).toMatch(/Gamma/);
  });

  it('sorts collections alphabetically descending', () => {
    const collections = [
      buildCollection({ id: '1', name: 'Beta' }),
      buildCollection({ id: '2', name: 'Alpha' }),
      buildCollection({ id: '3', name: 'Gamma' }),
    ];

    renderCollectionsList({
      collections,
      sortBy: CollectionSortOption.ALPHABETICAL_DESC,
    });

    const buttons = getCollectionButtons(['Alpha', 'Beta', 'Gamma']);
    const names = buttons.map((button) => button.textContent || '');
    expect(names[0]).toMatch(/Gamma/);
    expect(names[1]).toMatch(/Beta/);
    expect(names[2]).toMatch(/Alpha/);
  });

  it('loads more collections when clicking load more', () => {
    const collections = Array.from({ length: 12 }, (unusedValue, index) =>
      buildCollection({ id: `${index + 1}`, name: `Collection ${index + 1}` }),
    );

    renderCollectionsList({ collections });

    const virtuoso = screen.getByTestId('virtuoso');
    expect(virtuoso.getAttribute('data-total-count')).toBe('10');
    const loadMoreButton = screen.getByRole('button', { name: 'collections.load-more' });
    fireEvent.click(loadMoreButton);

    const updatedVirtuoso = screen.getByTestId('virtuoso');
    expect(updatedVirtuoso.getAttribute('data-total-count')).toBe('12');
  });
});

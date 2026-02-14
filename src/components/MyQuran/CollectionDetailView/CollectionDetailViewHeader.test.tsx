/* eslint-disable i18next/no-literal-string */
import React from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import CollectionDetailViewHeader from './CollectionDetailViewHeader';

vi.mock('next/router', () => ({
  useRouter: () => ({ locale: 'en', pathname: '/', query: {}, asPath: '/' }),
}));

vi.mock('@/icons/chevron-left.svg', () => ({ default: () => <span>chev</span> }));
vi.mock('@/icons/menu_more_horiz.svg', () => ({ default: () => <span>more</span> }));

vi.mock('@/components/Collection/CollectionActionsPopover/CollectionHeaderActionsPopover', () => ({
  default: ({
    children,
    onEditClick,
    onDeleteClick,
    onCopyClick,
    onPinVersesClick,
    onNoteClick,
  }: any) => (
    <div data-testid="header-actions">
      {children}
      {onEditClick && (
        <button type="button" onClick={onEditClick}>
          edit
        </button>
      )}
      {onDeleteClick && (
        <button type="button" onClick={onDeleteClick}>
          delete
        </button>
      )}
      {onCopyClick && (
        <button type="button" onClick={onCopyClick}>
          copy
        </button>
      )}
      <button type="button" onClick={onPinVersesClick}>
        pin
      </button>
      <button type="button" onClick={onNoteClick}>
        note
      </button>
    </div>
  ),
}));

describe('CollectionDetailViewHeader', () => {
  const t = (key: string, query?: Record<string, unknown>) =>
    query?.count ? `${key}:${query.count}` : key;

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders singular and plural item count keys', () => {
    const { rerender } = render(
      <CollectionDetailViewHeader
        collectionName="My Collection"
        totalCount={1}
        lang="en"
        t={t as any}
        onBack={vi.fn()}
        onCopyClick={vi.fn()}
        onNoteClick={vi.fn()}
        onPinVersesClick={vi.fn()}
        onEditClick={vi.fn()}
        onDeleteClick={vi.fn()}
      />,
    );

    expect(screen.getByText('collections.items:1')).toBeDefined();

    rerender(
      <CollectionDetailViewHeader
        collectionName="My Collection"
        totalCount={2}
        lang="en"
        t={t as any}
        onBack={vi.fn()}
        onCopyClick={vi.fn()}
        onNoteClick={vi.fn()}
        onPinVersesClick={vi.fn()}
        onEditClick={vi.fn()}
        onDeleteClick={vi.fn()}
      />,
    );

    expect(screen.getByText('collections.items_plural:2')).toBeDefined();
  });

  it('calls onBack when back button is clicked', () => {
    const onBack = vi.fn();
    render(
      <CollectionDetailViewHeader
        collectionName="My Collection"
        totalCount={1}
        lang="en"
        t={t as any}
        onBack={onBack}
        onCopyClick={vi.fn()}
        onNoteClick={vi.fn()}
        onPinVersesClick={vi.fn()}
        onEditClick={vi.fn()}
        onDeleteClick={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /My Collection/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('hides edit/delete actions for default collection', () => {
    render(
      <CollectionDetailViewHeader
        collectionName="My Collection"
        totalCount={1}
        lang="en"
        t={t as any}
        onBack={vi.fn()}
        isDefault
        onCopyClick={vi.fn()}
        onNoteClick={vi.fn()}
        onPinVersesClick={vi.fn()}
        onEditClick={vi.fn()}
        onDeleteClick={vi.fn()}
      />,
    );

    expect(screen.queryByRole('button', { name: 'edit' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'delete' })).toBeNull();
  });
});

/* eslint-disable i18next/no-literal-string */
import React from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import CollectionDetailViewBulkActionsBar from './CollectionDetailViewBulkActionsBar';

vi.mock('next/router', () => ({
  useRouter: () => ({ locale: 'en', pathname: '/', query: {}, asPath: '/' }),
}));

vi.mock('@/components/Collection/CollectionActionsPopover/CollectionBulkActionsPopover', () => ({
  default: ({ children, onCopyClick, onDeleteClick }: any) => (
    <div data-testid="bulk-actions-popover">
      {children}
      {onCopyClick && (
        <button type="button" onClick={onCopyClick}>
          bulk-copy
        </button>
      )}
      {onDeleteClick && (
        <button type="button" onClick={onDeleteClick}>
          bulk-delete
        </button>
      )}
    </div>
  ),
}));

describe('CollectionDetailViewBulkActionsBar', () => {
  const t = (k: string, query?: any) => (query?.count ? `${k}:${query.count}` : k);

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('toggles expand/collapse label and calls handler', () => {
    const onToggleExpandCollapseAll = vi.fn();
    const onToggleSelectMode = vi.fn();

    const { rerender } = render(
      <CollectionDetailViewBulkActionsBar
        isAllExpanded={false}
        isSelectMode={false}
        isOwner
        lang="en"
        selectedCount={0}
        t={t as any}
        onToggleExpandCollapseAll={onToggleExpandCollapseAll}
        onToggleSelectMode={onToggleSelectMode}
        onBulkNoteClick={vi.fn()}
        onPinSelectedVerses={vi.fn()}
        onBulkCopyClick={vi.fn()}
        onBulkDeleteClick={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'bulk-actions.expand-all' }));
    expect(onToggleExpandCollapseAll).toHaveBeenCalledTimes(1);

    rerender(
      <CollectionDetailViewBulkActionsBar
        isAllExpanded
        isSelectMode={false}
        isOwner
        lang="en"
        selectedCount={0}
        t={t as any}
        onToggleExpandCollapseAll={onToggleExpandCollapseAll}
        onToggleSelectMode={onToggleSelectMode}
        onBulkNoteClick={vi.fn()}
        onPinSelectedVerses={vi.fn()}
        onBulkCopyClick={vi.fn()}
        onBulkDeleteClick={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'bulk-actions.collapse-all' })).toBeDefined();
  });

  it('shows select button when not in select mode', () => {
    const onToggleSelectMode = vi.fn();
    render(
      <CollectionDetailViewBulkActionsBar
        isAllExpanded={false}
        isSelectMode={false}
        isOwner
        lang="en"
        selectedCount={0}
        t={t as any}
        onToggleExpandCollapseAll={vi.fn()}
        onToggleSelectMode={onToggleSelectMode}
        onBulkNoteClick={vi.fn()}
        onPinSelectedVerses={vi.fn()}
        onBulkCopyClick={vi.fn()}
        onBulkDeleteClick={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'bulk-actions.select' }));
    expect(onToggleSelectMode).toHaveBeenCalledTimes(1);
  });

  it('shows actions in select mode and only enables delete for owners', () => {
    const onBulkCopyClick = vi.fn();
    const onBulkDeleteClick = vi.fn();

    render(
      <CollectionDetailViewBulkActionsBar
        isAllExpanded={false}
        isSelectMode
        isOwner={false}
        lang="en"
        selectedCount={2}
        t={t as any}
        onToggleExpandCollapseAll={vi.fn()}
        onToggleSelectMode={vi.fn()}
        onBulkNoteClick={vi.fn()}
        onPinSelectedVerses={vi.fn()}
        onBulkCopyClick={onBulkCopyClick}
        onBulkDeleteClick={onBulkDeleteClick}
      />,
    );

    // Copy should always be wired in the popover.
    fireEvent.click(screen.getByRole('button', { name: 'bulk-copy' }));
    expect(onBulkCopyClick).toHaveBeenCalledTimes(1);

    // Delete shouldn't be rendered for non-owners.
    expect(screen.queryByRole('button', { name: 'bulk-delete' })).toBeNull();
  });
});

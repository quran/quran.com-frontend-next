import React from 'react';

import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import useResolvedBookmarkPage from './useResolvedBookmarkPage';

vi.mock('@/utils/verse', () => ({
  getVersePageNumber: vi.fn(async () => 12),
}));

const TestComp = ({ bookmark, mushafId }: { bookmark: string | null; mushafId: number }) => {
  const { resolvedPage } = useResolvedBookmarkPage(bookmark, mushafId as any);
  return <div data-testid="rp" data-page={resolvedPage ?? ''} />;
};

describe('useResolvedBookmarkPage', () => {
  beforeEach(() => {
    cleanup();
  });

  it('resolves page via verse mapping for extended bookmark', async () => {
    render(<TestComp bookmark="page:10:3:1" mushafId={2} />);
    const el = await screen.findByTestId('rp');
    await waitFor(() => expect(el.getAttribute('data-page')).toBe('12'));
  });

  it('falls back to stored page if mapping fails', async () => {
    cleanup();
    const mod = await import('@/utils/verse');
    const fn = mod.getVersePageNumber as any;
    fn.mockReset();
    fn.mockRejectedValue(new Error('fail'));
    render(<TestComp bookmark="page:10:2:255" mushafId={2} />);
    const el = screen.getByTestId('rp');
    expect(el.getAttribute('data-page')).toBe('10');
  });

  it('returns null for legacy page bookmark without verse', () => {
    render(<TestComp bookmark="page:5" mushafId={2} />);
    const el = screen.getByTestId('rp');
    expect(el.getAttribute('data-page')).toBe('');
  });
});

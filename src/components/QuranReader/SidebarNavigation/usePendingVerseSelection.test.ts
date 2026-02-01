/* eslint-disable react-func/max-lines-per-function */
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import usePendingVerseSelection from './usePendingVerseSelection';

const mockPush = vi.fn().mockResolvedValue(true);

vi.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('usePendingVerseSelection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPendingHook = (lastReadVerseKey?: string) =>
    renderHook(({ lastReadVerseKey: key }) => usePendingVerseSelection({ lastReadVerseKey: key }), {
      initialProps: { lastReadVerseKey },
    });

  it('clears pending on exact match', async () => {
    const { result, rerender } = renderPendingHook();

    act(() => {
      result.current.setPendingSelectedVerseKey('2:200');
    });

    rerender({ lastReadVerseKey: '2:200' });

    await waitFor(() => {
      expect(result.current.pendingSelectedVerseKey).toBeNull();
    });
  });

  it('keeps pending when within threshold', async () => {
    const { result, rerender } = renderPendingHook();

    act(() => {
      result.current.setPendingSelectedVerseKey('2:200');
    });

    rerender({ lastReadVerseKey: '2:198' });

    await waitFor(() => {
      expect(result.current.pendingSelectedVerseKey).toBe('2:200');
    });
  });

  it('clears pending after moving beyond threshold once nearby', async () => {
    const { result, rerender } = renderPendingHook();

    act(() => {
      result.current.setPendingSelectedVerseKey('2:200');
    });

    rerender({ lastReadVerseKey: '2:198' });

    await waitFor(() => {
      expect(result.current.pendingSelectedVerseKey).toBe('2:200');
    });

    rerender({ lastReadVerseKey: '2:210' });

    await waitFor(() => {
      expect(result.current.pendingSelectedVerseKey).toBeNull();
    });
  });

  it('clears pending on chapter mismatch', async () => {
    const { result, rerender } = renderPendingHook();

    act(() => {
      result.current.setPendingSelectedVerseKey('2:200');
    });

    rerender({ lastReadVerseKey: '3:1' });

    await waitFor(() => {
      expect(result.current.pendingSelectedVerseKey).toBeNull();
    });
  });

  it('clears pending on invalid verse keys', async () => {
    const { result, rerender } = renderPendingHook();

    act(() => {
      result.current.setPendingSelectedVerseKey('invalid');
    });

    rerender({ lastReadVerseKey: '2:1' });

    await waitFor(() => {
      expect(result.current.pendingSelectedVerseKey).toBeNull();
    });
  });
});

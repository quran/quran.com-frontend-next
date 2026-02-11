/* eslint-disable react-func/max-lines-per-function */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearPendingBookmarkModalRestore,
  consumePendingBookmarkModalRestore,
  setPendingBookmarkModalRestore,
} from './pendingBookmarkModalRestore';

const STORAGE_KEY = 'pending-bookmark-modal-restore';

const createVerse = (overrides = {}) =>
  ({
    chapterId: 2,
    verseNumber: 255,
    verseKey: '2:255',
    ...overrides,
  } as any);

describe('pendingBookmarkModalRestore', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('stores and consumes a valid pending restore payload', () => {
    setPendingBookmarkModalRestore({
      verse: createVerse(),
      verseKey: '2:255',
      redirectUrl: '/2?startingVerse=255',
    });

    const consumedPayload = consumePendingBookmarkModalRestore('/2?startingVerse=255');

    expect(consumedPayload).toBeTruthy();
    expect(consumedPayload?.verseKey).toBe('2:255');
    expect(consumedPayload?.redirectUrl).toBe('/2?startingVerse=255');
    expect(window.sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('matches localized paths when consuming payload', () => {
    setPendingBookmarkModalRestore({
      verse: createVerse(),
      verseKey: '2:255',
      redirectUrl: '/2?startingVerse=255',
    });

    const consumedPayload = consumePendingBookmarkModalRestore('/ar/2?startingVerse=255');

    expect(consumedPayload).toBeTruthy();
    expect(consumedPayload?.verseKey).toBe('2:255');
  });

  it('does not consume when current path does not match redirect path', () => {
    setPendingBookmarkModalRestore({
      verse: createVerse(),
      verseKey: '2:255',
      redirectUrl: '/2?startingVerse=255',
    });

    const consumedPayload = consumePendingBookmarkModalRestore('/3?startingVerse=255');

    expect(consumedPayload).toBeNull();
    expect(window.sessionStorage.getItem(STORAGE_KEY)).toBeTruthy();
  });

  it('clears payload when it is older than max allowed age', () => {
    const now = new Date('2026-02-11T00:00:00.000Z').getTime();
    vi.spyOn(Date, 'now').mockReturnValue(now);

    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        verse: createVerse(),
        verseKey: '2:255',
        redirectUrl: '/2?startingVerse=255',
        createdAt: now - 31 * 60 * 1000,
      }),
    );

    const consumedPayload = consumePendingBookmarkModalRestore('/2?startingVerse=255');

    expect(consumedPayload).toBeNull();
    expect(window.sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('clears payload when storage data is invalid json', () => {
    window.sessionStorage.setItem(STORAGE_KEY, '{invalid-json');

    const consumedPayload = consumePendingBookmarkModalRestore('/2?startingVerse=255');

    expect(consumedPayload).toBeNull();
    expect(window.sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('clears payload when it has invalid verse data', () => {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        verse: { chapterId: 2, verseKey: '2:255' },
        verseKey: '2:255',
        redirectUrl: '/2?startingVerse=255',
        createdAt: Date.now(),
      }),
    );

    const consumedPayload = consumePendingBookmarkModalRestore('/2?startingVerse=255');

    expect(consumedPayload).toBeNull();
    expect(window.sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('can clear payload manually', () => {
    setPendingBookmarkModalRestore({
      verse: createVerse(),
      verseKey: '2:255',
      redirectUrl: '/2?startingVerse=255',
    });

    clearPendingBookmarkModalRestore();

    expect(window.sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

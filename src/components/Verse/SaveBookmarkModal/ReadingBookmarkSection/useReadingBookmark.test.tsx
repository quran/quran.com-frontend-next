import { configureStore } from '@reduxjs/toolkit';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, it, expect, vi } from 'vitest';

import useReadingBookmark from './useReadingBookmark';

import DataContext from '@/contexts/DataContext';
import guestBookmarkReducer, {
  selectGuestReadingBookmark,
  setGuestReadingBookmark,
} from '@/redux/slices/guestBookmark';
import { ReadingBookmarkType } from '@/types/Bookmark';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (k: string) => k, lang: 'en' }),
}));

describe('useReadingBookmark (guest)', () => {
  const chapters = {
    '1': {
      versesCount: 7,
      bismillahPre: true,
      revelationOrder: 5,
      revelationPlace: 'meccan',
      pages: [1, 2],
      nameComplex: 'Al-Fatihah',
      transliteratedName: 'Al-Fatihah',
      nameArabic: 'الفاتحة',
      translatedName: 'The Opening',
      defaultSlug: 'al-fatihah',
    },
  } as any;

  const makeStore = () =>
    configureStore({
      reducer: { guestBookmark: guestBookmarkReducer },
    });

  const wrapper =
    (store: ReturnType<typeof makeStore>) =>
    ({ children }: { children: React.ReactNode }) =>
      (
        <Provider store={store}>
          <DataContext.Provider value={chapters}>{children}</DataContext.Provider>
        </Provider>
      );

  it('sets ayah bookmark for guest users', async () => {
    const store = makeStore();
    const verseKey = '1:1';
    const { result } = renderHook(
      () =>
        useReadingBookmark({
          type: ReadingBookmarkType.AYAH,
          verseKey,
          currentReadingBookmark: null,
          lang: 'en',
          isLoggedIn: false,
        }),
      { wrapper: wrapper(store) },
    );
    expect(result.current.isSelected).toBe(false);
    await result.current.handleSetReadingBookmark();
    await vi.waitFor(() => {
      const state = store.getState();
      expect(selectGuestReadingBookmark(state as any)).toBe('ayah:1:1');
      expect(result.current.isSelected).toBe(true);
    });
  });

  it('shows page display name for page bookmarks', async () => {
    const store = makeStore();
    const { result } = renderHook(
      () =>
        useReadingBookmark({
          type: ReadingBookmarkType.PAGE,
          pageNumber: 3,
          currentReadingBookmark: null,
          lang: 'en',
          isLoggedIn: false,
        }),
      { wrapper: wrapper(store) },
    );
    expect(result.current.resourceDisplayName).toContain('page');
  });

  it('undoes to previous bookmark value', async () => {
    const store = makeStore();
    store.dispatch(setGuestReadingBookmark('ayah:1:2'));
    const verseKey = '1:1';
    const { result } = renderHook(
      () =>
        useReadingBookmark({
          type: ReadingBookmarkType.AYAH,
          verseKey,
          currentReadingBookmark: null,
          lang: 'en',
          isLoggedIn: false,
        }),
      { wrapper: wrapper(store) },
    );
    await result.current.handleSetReadingBookmark();
    await vi.waitFor(() => {
      const state = store.getState();
      expect(selectGuestReadingBookmark(state as any)).toBe('ayah:1:1');
      expect(result.current.previousBookmarkValue).toBe('ayah:1:2');
    });
    await result.current.handleUndoReadingBookmark();
    await vi.waitFor(() => {
      const state = store.getState();
      expect(selectGuestReadingBookmark(state as any)).toBe('ayah:1:2');
    });
  });

  it('ignores invalid removal for guest bookmark (no error)', async () => {
    const store = makeStore();
    store.dispatch(setGuestReadingBookmark('ayah:1:1'));
    const { result } = renderHook(
      () =>
        useReadingBookmark({
          type: ReadingBookmarkType.AYAH,
          verseKey: '1:1',
          currentReadingBookmark: null,
          lang: 'en',
          isLoggedIn: false,
        }),
      { wrapper: wrapper(store) },
    );
    await result.current.handleRemoveCurrentBookmark();
    await vi.waitFor(() => {
      const state = store.getState();
      expect(selectGuestReadingBookmark(state as any)).toBe('');
      expect(result.current.error).toBeNull();
    });
  });
});

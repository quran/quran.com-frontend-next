import React from 'react';

import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import useCollectionDetailViewDeps from './useCollectionDetailViewDeps';

import DataContext from 'src/contexts/DataContext';

const dispatch = vi.fn();
const toast = vi.fn();
const invalidateAllBookmarkCaches = vi.fn();
const globalMutate = vi.fn(async () => undefined);

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key, lang: 'en' }),
}));

vi.mock('react-redux', () => ({
  useDispatch: () => dispatch,
  useSelector: (selector: any) =>
    selector({
      quranReaderStyles: { quranFont: 'hafs', mushafLines: 16 },
      translations: { selectedTranslations: [20, 131] },
    }),
  shallowEqual: (a: unknown, b: unknown) => a === b,
}));

vi.mock('@/redux/slices/QuranReader/styles', () => ({
  selectQuranReaderStyles: (state: any) => state.quranReaderStyles,
}));

vi.mock('@/dls/Toast/Toast', () => ({
  useToast: () => toast,
}));

vi.mock('@/hooks/auth/useIsLoggedIn', () => ({
  default: () => ({ isLoggedIn: true }),
}));

vi.mock('@/hooks/useBookmarkCacheInvalidator', () => ({
  default: () => ({ invalidateAllBookmarkCaches }),
}));

vi.mock('swr', () => ({
  useSWRConfig: () => ({ mutate: globalMutate }),
}));

vi.mock('@/utils/api', () => ({
  getMushafId: () => ({ mushaf: 7 }),
}));

describe('useCollectionDetailViewDeps', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns translation, redux, swr and derived deps', () => {
    const wrapper = ({ children }: any) => (
      <DataContext.Provider value={{ chapters: {} } as any}>{children}</DataContext.Provider>
    );

    const { result } = renderHook(() => useCollectionDetailViewDeps(), { wrapper });

    expect(result.current.lang).toBe('en');
    expect(result.current.selectedTranslations).toEqual([20, 131]);
    expect(result.current.mushafId).toBe(7);
    expect(result.current.dispatch).toBe(dispatch);
    expect(result.current.toast).toBe(toast);
    expect(result.current.globalMutate).toBe(globalMutate);
    expect(result.current.invalidateAllBookmarkCaches).toBe(invalidateAllBookmarkCaches);
    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.chaptersData).toEqual({ chapters: {} });
  });
});

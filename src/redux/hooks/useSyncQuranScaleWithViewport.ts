import { useEffect } from 'react';

import type { RootState } from '@/redux/RootState';
import { setQuranTextFontScale } from '@/redux/slices/QuranReader/styles';
import isClient from '@/utils/isClient';
import { clampQuranScaleForViewport } from '@/utils/quran-font-scale';

type QuranScaleState = Partial<
  Pick<RootState, 'quranReaderStyles'> & {
    quranReaderStyles?: { quranTextFontScale?: number };
  }
>;

type QuranScaleStore = {
  getState: () => QuranScaleState;
  dispatch: (action: ReturnType<typeof setQuranTextFontScale>) => void;
  subscribe: (listener: () => void) => () => void;
};

export const syncQuranScaleWithViewport = (store: QuranScaleStore): void => {
  if (!isClient) return;
  const viewportWidth = document.documentElement.clientWidth;
  const currentScale = store.getState().quranReaderStyles?.quranTextFontScale;
  if (currentScale == null) return;
  const nextScale = clampQuranScaleForViewport(currentScale, viewportWidth);
  if (currentScale !== nextScale) {
    store.dispatch(setQuranTextFontScale(nextScale));
  }
};

const useSyncQuranScaleWithViewport = (store: QuranScaleStore): void => {
  useEffect(() => {
    if (!isClient) return undefined;

    const sync = () => {
      syncQuranScaleWithViewport(store);
    };

    sync();
    const unsubscribe = store.subscribe(sync);
    window.addEventListener('resize', sync);

    return () => {
      unsubscribe();
      window.removeEventListener('resize', sync);
    };
  }, [store]);
};

export default useSyncQuranScaleWithViewport;

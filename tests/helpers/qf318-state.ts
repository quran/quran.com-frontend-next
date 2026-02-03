import type { Page } from '@playwright/test';

export const waitForReduxHydration = async (page: Page): Promise<void> => {
  await page.waitForFunction(
    () => {
      try {
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
          return false;
        }

        const storage = localStorage.getItem('persist:root');
        if (!storage) return false;

        const parsed = JSON.parse(storage);
        const persistData = parsed._persist;
        if (!persistData) return false;

        const persistInfo = JSON.parse(persistData);
        return persistInfo.rehydrated === true;
      } catch {
        return false;
      }
    },
    { timeout: 15000 },
  );
};

export const getPersistedSlice = async <T>(page: Page, sliceName: string): Promise<T | null> => {
  return page.evaluate((slice) => {
    try {
      const raw = localStorage.getItem('persist:root');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const sliceRaw = parsed[slice];
      if (!sliceRaw) return null;
      return JSON.parse(sliceRaw);
    } catch {
      return null;
    }
  }, sliceName);
};

export const clearClientStorage = async (page: Page): Promise<void> => {
  await page.evaluate(() => {
    if (typeof Storage !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
  });
};

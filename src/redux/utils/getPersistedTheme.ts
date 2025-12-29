import { RootState } from '../RootState';
import SliceName from '../types/SliceName';

const PERSIST_KEY = 'persist:root';

/**
 * Get persisted theme from localStorage to prevent theme flash when locale changes.
 * This ensures the user's current theme is preserved when the store is recreated.
 *
 * @returns {RootState[SliceName.THEME] | null} The persisted theme state or null if not found
 */
const getPersistedTheme = (): RootState[SliceName.THEME] | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const persistedState = localStorage.getItem(PERSIST_KEY);
    if (!persistedState) {
      return null;
    }

    const parsed = JSON.parse(persistedState);
    const themeState = parsed[SliceName.THEME];
    if (!themeState) {
      return null;
    }

    return JSON.parse(themeState);
  } catch (error) {
    return null;
  }
};

export default getPersistedTheme;

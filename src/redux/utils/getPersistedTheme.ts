import { RootState } from '../RootState';
import SliceName from '../types/SliceName';

// NOTE: This key must stay in sync with `persistConfig.key` in `store.ts`.
// `redux-persist` prefixes the key with `persist:`, so if `persistConfig.key`
// changes from 'root', this constant must be updated accordingly.
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

    // NOTE: Double JSON.parse is intentional. Redux-persist stringifies each slice
    // value individually before storing them in the top-level object. So after the
    // first parse (line 26), `themeState` is still a JSON string, not an object.
    return JSON.parse(themeState);
  } catch (error) {
    // Log the error to aid diagnosing issues with localStorage access or corrupted persisted state.
    // eslint-disable-next-line no-console -- Console logging is acceptable here for debugging persistence issues.
    console.error('Failed to get persisted theme from localStorage', error);
    return null;
  }
};

export default getPersistedTheme;

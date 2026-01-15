import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import getPersistedTheme from './getPersistedTheme';

import SliceName from '@/redux/types/SliceName';
import ThemeType from '@/redux/types/ThemeType';

const PERSIST_KEY = 'persist:root';

const createMockPersistedState = (themeState: { type: ThemeType } | null) => {
  const state: Record<string, string> = {};
  if (themeState !== null) {
    state[SliceName.THEME] = JSON.stringify(themeState);
  }
  return JSON.stringify(state);
};

// eslint-disable-next-line react-func/max-lines-per-function
describe('getPersistedTheme', () => {
  let getItemSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Spy on localStorage.getItem
    getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    getItemSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('successfully reading and parsing persisted theme', () => {
    it('should return the persisted theme when it exists in localStorage', () => {
      const mockTheme = { type: ThemeType.Dark };
      const mockPersistedState = createMockPersistedState(mockTheme);

      getItemSpy.mockReturnValue(mockPersistedState);

      const result = getPersistedTheme();

      expect(getItemSpy).toHaveBeenCalledWith(PERSIST_KEY);
      expect(result).toEqual(mockTheme);
    });

    it('should return the light theme when persisted', () => {
      const mockTheme = { type: ThemeType.Light };
      const mockPersistedState = createMockPersistedState(mockTheme);

      getItemSpy.mockReturnValue(mockPersistedState);

      const result = getPersistedTheme();

      expect(result).toEqual(mockTheme);
    });

    it('should return the sepia theme when persisted', () => {
      const mockTheme = { type: ThemeType.Sepia };
      const mockPersistedState = createMockPersistedState(mockTheme);

      getItemSpy.mockReturnValue(mockPersistedState);

      const result = getPersistedTheme();

      expect(result).toEqual(mockTheme);
    });
  });

  describe('handling missing localStorage data', () => {
    it('should return null when localStorage has no persisted state', () => {
      getItemSpy.mockReturnValue(null);

      const result = getPersistedTheme();

      expect(result).toBeNull();
    });

    it('should return null when localStorage returns empty string', () => {
      getItemSpy.mockReturnValue('');

      const result = getPersistedTheme();

      // Empty string is falsy, so it should return null
      expect(result).toBeNull();
    });
  });

  describe('handling SSR (typeof window === undefined)', () => {
    it('should return null when window is undefined (SSR)', () => {
      // Save original window
      const originalWindow = global.window;

      delete global.window;

      const result = getPersistedTheme();

      expect(result).toBeNull();

      // Restore window
      global.window = originalWindow;
    });
  });

  describe('handling corrupted JSON', () => {
    it('should return null and log error when persistedState is invalid JSON', () => {
      getItemSpy.mockReturnValue('not valid json{');

      const result = getPersistedTheme();

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to get persisted theme from localStorage',
        expect.any(SyntaxError),
      );
    });

    it('should return null and log error when theme slice is invalid JSON', () => {
      // Create a valid outer object but with invalid JSON for the theme slice
      const invalidThemeState = JSON.stringify({
        [SliceName.THEME]: 'not valid json{',
      });
      getItemSpy.mockReturnValue(invalidThemeState);

      const result = getPersistedTheme();

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to get persisted theme from localStorage',
        expect.any(SyntaxError),
      );
    });
  });

  describe('handling missing theme in persisted state', () => {
    it('should return null when theme slice is not present in persisted state', () => {
      // Create persisted state without theme slice
      const mockPersistedState = JSON.stringify({
        [SliceName.TRANSLATIONS]: JSON.stringify({ selectedTranslations: [131] }),
      });
      getItemSpy.mockReturnValue(mockPersistedState);

      const result = getPersistedTheme();

      expect(result).toBeNull();
    });

    it('should return null when theme slice is null', () => {
      const mockPersistedState = JSON.stringify({
        [SliceName.THEME]: null,
      });
      getItemSpy.mockReturnValue(mockPersistedState);

      const result = getPersistedTheme();

      expect(result).toBeNull();
    });

    it('should return null when theme slice is undefined', () => {
      const mockPersistedState = JSON.stringify({
        [SliceName.THEME]: undefined,
      });
      getItemSpy.mockReturnValue(mockPersistedState);

      const result = getPersistedTheme();

      expect(result).toBeNull();
    });

    it('should return null when parsed state is an empty object', () => {
      const mockPersistedState = JSON.stringify({});
      getItemSpy.mockReturnValue(mockPersistedState);

      const result = getPersistedTheme();

      expect(result).toBeNull();
    });
  });
});

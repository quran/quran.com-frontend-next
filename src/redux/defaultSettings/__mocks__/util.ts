/**
 * Vitest manual mock for defaultSettings/util.
 *
 * The real util.ts uses require(`src/redux/defaultSettings/locales/${locale}`)
 * — a dynamic template-literal require that cannot be resolved by Vite's alias
 * system at runtime. This mock returns the English defaults statically, which
 * is correct for unit tests and avoids the CJS path resolution issue.
 *
 * Individual test files that need locale-specific values should call
 *   vi.mock('@/redux/defaultSettings/util', () => ({ ... }))
 * which will override this file.
 */
import type AudioState from '../../types/AudioState';
import type NotificationsState from '../../types/NotificationsState';
import type QuranReaderStyles from '../../types/QuranReaderStyles';
import type ReadingPreferences from '../../types/ReadingPreferences';
import SliceName from '../../types/SliceName';
import type TafsirsSettings from '../../types/TafsirsSettings';
import type Theme from '../../types/Theme';
import type TranslationsSettings from '../../types/TranslationsSettings';
import type { DefaultSettings } from '../defaultSettings';
import DEFAULT_SETTINGS from '../defaultSettings';

export const getLocaleInitialState = (): DefaultSettings => DEFAULT_SETTINGS;

// Return type is intentionally loose to avoid RootState's PersistPartial constraints
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getStoreInitialState = (): any => ({
  [SliceName.THEME]: DEFAULT_SETTINGS[SliceName.THEME],
  [SliceName.READING_PREFERENCES]: DEFAULT_SETTINGS[SliceName.READING_PREFERENCES],
  [SliceName.QURAN_READER_STYLES]: DEFAULT_SETTINGS[SliceName.QURAN_READER_STYLES],
  [SliceName.TRANSLATIONS]: DEFAULT_SETTINGS[SliceName.TRANSLATIONS],
  [SliceName.TAFSIRS]: DEFAULT_SETTINGS[SliceName.TAFSIRS],
  [SliceName.AUDIO_PLAYER_STATE]: DEFAULT_SETTINGS[SliceName.AUDIO_PLAYER_STATE],
  [SliceName.DEFAULT_SETTINGS]: { isUsingDefaultSettings: true },
  [SliceName.NOTIFICATIONS]: DEFAULT_SETTINGS[SliceName.NOTIFICATIONS],
});

export const getThemeInitialState = (): Theme => DEFAULT_SETTINGS[SliceName.THEME];

export const getReadingPreferencesInitialState = (): ReadingPreferences =>
  DEFAULT_SETTINGS[SliceName.READING_PREFERENCES];

export const getQuranReaderStylesInitialState = (): QuranReaderStyles =>
  DEFAULT_SETTINGS[SliceName.QURAN_READER_STYLES];

export const getTranslationsInitialState = (): TranslationsSettings =>
  DEFAULT_SETTINGS[SliceName.TRANSLATIONS];

export const getTafsirsInitialState = (): TafsirsSettings => DEFAULT_SETTINGS[SliceName.TAFSIRS];

export const getAudioPlayerStateInitialState = (): AudioState =>
  DEFAULT_SETTINGS[SliceName.AUDIO_PLAYER_STATE];

export const getNotificationsInitialState = (): NotificationsState =>
  DEFAULT_SETTINGS[SliceName.NOTIFICATIONS];

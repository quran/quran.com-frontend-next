/**
 * Vitest manual mock for defaultSettings/util.
 *
 * The real util.ts uses require(`src/redux/defaultSettings/locales/${locale}`)
 * — a dynamic template-literal require that cannot be resolved by Vite's alias
 * system at runtime. This mock returns the English defaults statically, which
 * is correct for unit tests and avoids the CJS path resolution issue.
 *
 * Tests that need locale-specific values should override this mock:
 *   vi.mock('@/redux/defaultSettings/util', () => ({
 *     getStoreInitialState: (locale: string) => customDefaults,
 *   }))
 *
 * These functions have no locale parameter — they always return English defaults.
 * The real util.ts functions accept a locale argument, but JavaScript silently
 * ignores extra arguments, so call sites that pass a locale still work at runtime.
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

/**
 * Returns the full default settings object (English locale).
 * Tests that need non-English defaults should provide their own vi.mock override.
 * @returns {DefaultSettings} The application's default settings
 */
export const getLocaleInitialState = (): DefaultSettings => DEFAULT_SETTINGS;

/**
 * Returns the initial Redux store state for all slices (English locale).
 * Return type is intentionally loose to avoid RootState's PersistPartial constraints.
 * Tests that need non-English defaults should provide their own vi.mock override.
 * @returns Store state object with all required slices populated from defaults
 */
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

/**
 * Returns the initial theme slice state (English locale).
 * @returns {Theme} The default theme settings
 */
export const getThemeInitialState = (): Theme => DEFAULT_SETTINGS[SliceName.THEME];

/**
 * Returns the initial reading preferences slice state (English locale).
 * @returns {ReadingPreferences} The default reading preferences
 */
export const getReadingPreferencesInitialState = (): ReadingPreferences =>
  DEFAULT_SETTINGS[SliceName.READING_PREFERENCES];

/**
 * Returns the initial Quran reader styles slice state (English locale).
 * @returns {QuranReaderStyles} The default Quran reader styles
 */
export const getQuranReaderStylesInitialState = (): QuranReaderStyles =>
  DEFAULT_SETTINGS[SliceName.QURAN_READER_STYLES];

/**
 * Returns the initial translations settings slice state (English locale).
 * @returns {TranslationsSettings} The default translations settings
 */
export const getTranslationsInitialState = (): TranslationsSettings =>
  DEFAULT_SETTINGS[SliceName.TRANSLATIONS];

/**
 * Returns the initial tafsirs settings slice state (English locale).
 * @returns {TafsirsSettings} The default tafsirs settings
 */
export const getTafsirsInitialState = (): TafsirsSettings => DEFAULT_SETTINGS[SliceName.TAFSIRS];

/**
 * Returns the initial audio player slice state (English locale).
 * @returns {AudioState} The default audio player state
 */
export const getAudioPlayerStateInitialState = (): AudioState =>
  DEFAULT_SETTINGS[SliceName.AUDIO_PLAYER_STATE];

/**
 * Returns the initial notifications slice state (English locale).
 * @returns {NotificationsState} The default notifications state
 */
export const getNotificationsInitialState = (): NotificationsState =>
  DEFAULT_SETTINGS[SliceName.NOTIFICATIONS];

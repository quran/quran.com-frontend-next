// eslint-disable-next-line import/no-extraneous-dependencies
import { Middleware } from 'redux';

import { RootState } from '../RootState';
import { setIsUsingDefaultSettings } from '../slices/defaultSettings';
import { RESET_SETTINGS_EVENT } from '../slices/reset-settings';

const OBSERVED_ACTIONS = [
  'theme/setTheme',
  'readingPreferences/setReadingPreference',
  'readingPreferences/setSelectedWordByWordLocale',
  'readingPreferences/setSelectedWordByWordTransliteration',
  'readingPreferences/setSelectedWordByWordTranslation',
  'readingPreferences/setShowWordByWordTranslation',
  'readingPreferences/setShowWordByWordTransliteration',
  'readingPreferences/setShowTooltipFor',
  'readingPreferences/setWordClickFunctionality',
  'quranReaderStyles/setQuranFont',
  'quranReaderStyles/setMushafLines',
  'quranReaderStyles/increaseQuranTextFontScale',
  'quranReaderStyles/decreaseQuranTextFontScale',
  'quranReaderStyles/decreaseTranslationFontScale',
  'quranReaderStyles/increaseTranslationFontScale',
  'translations/setSelectedTranslations',
  'quranReaderStyles/increaseTafsirFontScale',
  'quranReaderStyles/decreaseTafsirFontScale',
  'tafsirs/setSelectedTafsirs',
  'audioPlayerState/setEnableAutoScrolling',
  'audioPlayerState/setPlaybackRate',
  'audioPlayerState/setReciter',
  'prayerTimes/setCalculationMethod',
  'prayerTimes/setMadhab',
];

/**
 * A middleware that listens to certain dispatched actions and
 * in turn dispatches an action that indicates that the user is
 * no longer using the default settings which will be used later
 * when switching between locales to determine whether we want
 * to apply the new locale's default settings or keep the current
 * setting as they are.
 *
 * @param {MiddlewareAPI<Dispatch<AnyAction>} storeAPI
 * @returns {Dispatch<any>(action: any) => any}
 */
const DefaultSettingsMiddleware: Middleware<
  // eslint-disable-next-line @typescript-eslint/ban-types
  {}, // Most middleware do not modify the dispatch return value
  RootState
> = (storeAPI) => (next) => (action) => {
  const { type } = action;
  // the moment any of the actions that change the settings has changed, it means we are no longer using the default settings
  if (OBSERVED_ACTIONS.includes(type)) {
    storeAPI.dispatch({ type: setIsUsingDefaultSettings.type, payload: false });
  } else if (type === RESET_SETTINGS_EVENT) {
    storeAPI.dispatch({ type: setIsUsingDefaultSettings.type, payload: true });
  }
  return next(action);
};

export default DefaultSettingsMiddleware;

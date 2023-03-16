// eslint-disable-next-line import/no-extraneous-dependencies
import { Middleware } from 'redux';

import { RootState } from '../RootState';
import { setIsUsingDefaultSettings } from '../slices/defaultSettings';
import SliceName from '../types/SliceName';

import { RESET_SETTINGS_EVENT } from '@/redux/actions/reset-settings';

const OBSERVED_ACTIONS = [
  `${SliceName.THEME}/setTheme`,
  `${SliceName.READING_PREFERENCES}/setReadingPreference`,
  `${SliceName.READING_PREFERENCES}/setSelectedWordByWordLocale`,
  `${SliceName.READING_PREFERENCES}/setWordByWordContentType`,
  `${SliceName.READING_PREFERENCES}/setWordByWordDisplay`,
  `${SliceName.READING_PREFERENCES}/setWordClickFunctionality`,
  `${SliceName.QURAN_READER_STYLES}/setQuranFont`,
  `${SliceName.QURAN_READER_STYLES}/setMushafLines`,
  `${SliceName.QURAN_READER_STYLES}/increaseQuranTextFontScale`,
  `${SliceName.QURAN_READER_STYLES}/decreaseQuranTextFontScale`,
  `${SliceName.QURAN_READER_STYLES}/decreaseTranslationFontScale`,
  `${SliceName.QURAN_READER_STYLES}/increaseTranslationFontScale`,
  `${SliceName.TRANSLATIONS}/setSelectedTranslations`,
  `${SliceName.QURAN_READER_STYLES}/increaseTafsirFontScale`,
  `${SliceName.QURAN_READER_STYLES}/decreaseTafsirFontScale`,
  `${SliceName.TAFSIRS}/setSelectedTafsirs`,
  `${SliceName.AUDIO_PLAYER_STATE}/setEnableAutoScrolling`,
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

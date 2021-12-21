/* eslint-disable @typescript-eslint/naming-convention */
import { analytics } from 'src/lib/firebase';

const DRAWER_EVENT = 'drawer';
const BUTTON_CLICK_EVENT = 'button_click';
const LOCALE_CHANGE_EVENT = 'locale_change';
const SETTINGS_CHANGE_EVENT = 'settings_change';
const SETTINGS_VIEW_CHANGE_EVENT = 'settings_view_change';
const SEARCH_QUERY_EVENT = 'search_query';
const WBW = 'word_by_word';
const TRANSLATION = 'translation';
const TAFSIR = 'tafsir';
const AUDIO = 'audio';
const WBW_TOOLTIP = `${WBW}_tooltip`;
const PRAYER_TIMES = 'prayer_times';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logEvent = (eventName: string, params?: { [key: string]: any }) => {
  analytics().logEvent(eventName, params);
};

/**
 * Log drawer events.
 *
 * @param {string} drawerName
 * @param {boolean} isOpenAction
 * @param {string} actionSource the source of the close/open action e.g. click/keyboard_shortcut/outside_click/navigation
 */
export const logDrawerEvent = (drawerName: string, isOpenAction = true, actionSource = 'click') => {
  logEvent(DRAWER_EVENT, {
    drawer: drawerName,
    action: isOpenAction ? 'open' : 'close',
    action_source: actionSource,
  });
};

/**
 * Log button clicking events.
 *
 * @param {string} buttonName
 */
export const logButtonClickEvent = (buttonName: string) => {
  logEvent(BUTTON_CLICK_EVENT, {
    button: buttonName,
  });
};

/**
 * log locale change events.
 *
 * @param {string} currentLocale
 * @param {string} newLocale
 */
export const logLocaleChangeEvent = (currentLocale: string, newLocale: string) => {
  logEvent(LOCALE_CHANGE_EVENT, {
    current_locale: currentLocale,
    new_locale: newLocale,
  });
};

/**
 * Log settings change.
 *
 * @param {string} settingsName
 * @param {string | boolean | number | string[] | number[] | Record<string, string>} value
 */
export const logSettingsChangeEvent = (
  settingsName: string,
  value: string | number | boolean | string[] | number[] | Record<string, string>,
) => {
  logEvent(SETTINGS_CHANGE_EVENT, {
    name: settingsName,
    value,
  });
};

export const logAudioSettingsChangeEvent = (audioSettingsName: string, value: string | boolean) => {
  logSettingsChangeEvent(`${AUDIO}_${audioSettingsName}`, value);
};

export const logTafsirSettingsChangeEvent = (tafsirSettingsName: string, value: number) => {
  logSettingsChangeEvent(`${TAFSIR}_${tafsirSettingsName}`, value);
};

export const logTranslationSettingsChangeEvent = (
  translationSettingsName: string,
  value: number,
) => {
  logSettingsChangeEvent(`${TRANSLATION}_${translationSettingsName}`, value);
};

export const logWordByWordSettingsChangeEvent = (
  wordByWordSettingsName: string,
  value: boolean | string,
) => {
  logSettingsChangeEvent(`${WBW}_${wordByWordSettingsName}`, value);
};

export const logWordByWordTooltipSettingsChangeEvent = (
  wordByWordTooltipSettingsName: string,
  value: string | string[],
) => {
  logSettingsChangeEvent(`${WBW_TOOLTIP}${wordByWordTooltipSettingsName}`, value);
};

export const logPrayerTimesSettingsChangeEvent = (
  prayerTimesSettingsName: string,
  value: string | boolean,
) => {
  logSettingsChangeEvent(`${PRAYER_TIMES}_${prayerTimesSettingsName}`, value);
};

/**
 * Log when the settings view change e.g. the user opened the translation view.
 *
 * @param {string} newView
 * @param {string} currentView
 */
export const logSettingsViewChangeEvent = (newView: string, currentView: string) => {
  logEvent(SETTINGS_VIEW_CHANGE_EVENT, {
    current_view: currentView,
    new_view: newView,
  });
};

/**
 * Log any search query the user makes from any text input/ using voice search.
 *
 * @param {string} searchQuery
 * @param {string} source the source of the query e.g settings drawer translation view/command bar.
 * @param {boolean} hasResults
 * @param {string} type the type of the search query. can be voice or text.
 */
export const logSearchQuery = (
  searchQuery: string,
  source: string,
  hasResults = true,
  type = 'text',
) => {
  logEvent(SEARCH_QUERY_EVENT, {
    query: searchQuery,
    has_results: hasResults,
    source,
    type,
  });
};

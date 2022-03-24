/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */

import { isFirebaseEnabled } from 'src/lib/firebase';

export const logEvent = async (eventName: string, params?: { [key: string]: any }) => {
  if (isFirebaseEnabled) {
    import('src/lib/firebase').then((firebaseModule) => {
      // eslint-disable-next-line i18next/no-literal-string
      firebaseModule.analytics().logEvent(eventName, params);
    });
  }
};

/**
 * Log when a button is clicked.
 *
 * @param {string} buttonName
 */
export const logButtonClick = (buttonName: string) => {
  logEvent(`${buttonName}_clicked`);
};

/**
 * Log when a value changes.
 *
 * @param {string} name
 * @param {string | boolean | number | string[] | number[] | Record<string, string>} currentValue
 * @param {string | boolean | number | string[] | number[] | Record<string, string>} newValue
 */
export const logValueChange = (
  name: string,
  currentValue: string | number | boolean | string[] | number[] | Record<string, any>,
  newValue: string | number | boolean | string[] | number[] | Record<string, any>,
) => {
  logEvent(`${name}_change`, {
    current_value: currentValue,
    new_value: newValue,
  });
};

/**
 * Log when the user makes a search query whether through typing or voice search when there are no results.
 *
 * @param {string} searchQuery
 * @param {string} source the source of the query e.g settings drawer translation view/command bar.
 * @param {string} type the type of the search query. can be voice or text.
 */
export const logEmptySearchResults = (searchQuery: string, source: string, type = 'text') => {
  logEvent(`${type}_search_query_with_no_result`, {
    query: searchQuery,
    source,
  });
};

export const logTarteelLinkClick = (type: string) => {
  logEvent('tarteel_link_click', {
    type: `${type}_attribution`,
  });
};

/**
 * Log when an item selection status change.
 *
 * @param {string} itemName
 * @param {string | number} itemId
 * @param {boolean} isSelected
 */
export const logItemSelectionChange = (
  itemName: string,
  itemId: string | number,
  isSelected = true,
) => {
  logEvent(`${itemName}_${isSelected ? 'selected' : 'unselected'}`, { value: itemId });
};

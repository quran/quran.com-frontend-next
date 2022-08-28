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
 * Log when a form is submitted.
 *
 * @param {string} formName
 */
export const logFormSubmission = (formName: string) => {
  logEvent(`${formName}_form_submitted`);
};

/**
 * Log when a carousel slide is completed.
 *
 * @param {string} carouselName
 * @param {number|string} slideNumber
 */
export const logCarouselSlideCompletion = (carouselName: string, slideNumber: number | string) => {
  logEvent(`${carouselName}_slide_${slideNumber}_completed`);
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
  // if the searchQuery is not empty
  if (searchQuery) {
    logEvent(`${type}_search_query_with_no_result`, {
      query: searchQuery,
      source,
    });
  }
};

/**
 * Log text search queries entered by the user.
 *
 * @param {string} searchQuery
 * @param {string} source
 */
export const logTextSearchQuery = (searchQuery: string, source: string) => {
  // if the searchQuery is not empty
  if (searchQuery) {
    logEvent('search_query', {
      query: searchQuery,
      source,
    });
  }
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

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */

import SearchService from '@/types/Search/SearchService';
import SearchQuerySource from '@/types/SearchQuerySource';
import SearchType from '@/types/SearchType';
import { isFirebaseEnabled } from 'src/lib/firebase';

/**
 * Filter out empty search queries.
 *
 * @param {string} rawSearchQuery
 * @returns {string}
 */
const getSearchQuery = (rawSearchQuery: string): string => {
  if (!rawSearchQuery) {
    return '';
  }
  // trim search query so we don't log a query like ' '.
  return rawSearchQuery.trim();
};

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
export const logButtonClick = (buttonName: string, params?: { [key: string]: any }) => {
  logEvent(`${buttonName}_clicked`, params);
};

/**
 * Log when a form is submitted.
 *
 * @param {string} formName
 */
export const logFormSubmission = (formName: string, params?: { [key: string]: any }) => {
  logEvent(`${formName}_form_submitted`, params);
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
  params: Record<string, unknown> = {},
) => {
  logEvent(`${name}_change`, {
    current_value: currentValue,
    new_value: newValue,
    ...params,
  });
};

type SearchResultsParams = {
  query: string;
  source: SearchQuerySource;
  type?: SearchType;
  service?: SearchService;
};

/**
 * Log when the user makes a search query whether through typing or voice search when there are no results.
 *
 * @param {SearchResultsParams} eventData
 */
export const logEmptySearchResults = ({
  query: searchQuery,
  source,
  type = SearchType.Text,
  service,
}: SearchResultsParams) => {
  const query = getSearchQuery(searchQuery);
  // if the searchQuery is not empty
  if (query !== '') {
    logEvent(`${type}_search_query_with_no_result`, {
      query,
      source,
      ...(service && { service }),
    });
  }
};

/**
 * Log when the user makes a search query whether through typing or voice search when there are results.
 *
 * @param {SearchResultsParams} eventData
 */
export const logSearchResults = ({
  query: searchQuery,
  source,
  type = SearchType.Text,
  service,
}: SearchResultsParams) => {
  const query = getSearchQuery(searchQuery);
  // if the searchQuery is not empty
  if (query !== '') {
    logEvent('search_query_with_results', {
      type,
      query,
      source,
      ...(service && { service }),
    });
  }
};

/**
 * Log text search queries entered by the user.
 *
 * @param {string} searchQuery
 * @param {SearchQuerySource} source
 */
export const logTextSearchQuery = (searchQuery: string, source: SearchQuerySource) => {
  const query = getSearchQuery(searchQuery);
  // if the searchQuery is not empty
  if (query !== '') {
    logEvent('search_query', {
      query,
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

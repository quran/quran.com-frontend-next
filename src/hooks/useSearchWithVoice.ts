import { useState, useRef, useCallback, useEffect } from 'react';

import { useDispatch } from 'react-redux';

import { setIsExpanded } from '@/redux/slices/CommandBar/state';

/**
 * Custom hook to manage search state with voice search support
 *
 * @param {string} initialQuery - Initial search query
 * @param {boolean} isInSearchDrawer - Whether the hook is being used in the search drawer
 * @returns {object} Search state and handlers
 */
const useSearchWithVoice = (initialQuery: string = '', isInSearchDrawer: boolean = false) => {
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery || '');
  const [hasSearchResults, setHasSearchResults] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dispatch = useDispatch();

  // Function to ensure search results stay visible
  const keepSearchResultsVisible = useCallback(() => {
    // Only expand the command bar if we're not in the search drawer
    if (!isInSearchDrawer) {
      dispatch({ type: setIsExpanded.type, payload: true });
    }
  }, [dispatch, isInSearchDrawer]);

  // Update search query when initialQuery changes
  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);

      // If we have an initial search query, we should expand the results
      if (initialQuery.trim() !== '') {
        keepSearchResultsVisible();
        setHasSearchResults(true);
      }
    }
  }, [initialQuery, keepSearchResultsVisible]);

  // Update hasSearchResults when searchQuery changes
  useEffect(() => {
    const hasQuery = searchQuery.trim() !== '';
    setHasSearchResults(hasQuery);

    // Keep the search expanded if we have a query
    if (hasQuery) {
      keepSearchResultsVisible();

      // Set a timeout to ensure the search results stay visible
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        keepSearchResultsVisible();
      }, 500);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, keepSearchResultsVisible]);

  // Focus the input when the search query changes
  useEffect(() => {
    // Focus the input after a short delay to ensure it's ready
    const focusTimeout = setTimeout(() => {
      if (inputRef.current && searchQuery) {
        inputRef.current.focus();
      }
    }, 300);

    return () => clearTimeout(focusTimeout);
  }, [searchQuery]);

  /**
   * Handle when the search query is changed.
   *
   * @param {string} newSearchQuery
   * @returns {void}
   */
  const onSearchQueryChange = (newSearchQuery: string): void => {
    setSearchQuery(newSearchQuery);
    keepSearchResultsVisible();
    // Only set hasSearchResults based on query content if we're actually typing
    // This allows the dropdown to stay open even with an empty query when clicked
    setHasSearchResults(newSearchQuery.trim() !== '');
  };

  const onClearClicked = () => {
    setSearchQuery('');
    // Don't immediately hide results when clearing
    // Let the SearchInput component decide when to hide
    // This allows the dropdown to stay open after clearing
  };

  return {
    searchQuery,
    setSearchQuery,
    hasSearchResults,
    setHasSearchResults,
    inputRef,
    keepSearchResultsVisible,
    onSearchQueryChange,
    onClearClicked,
    isInSearchDrawer,
  };
};

export default useSearchWithVoice;

import { useState, useRef, useEffect } from 'react';

/**
 * Custom hook to manage search state with voice search support
 *
 * @param {string} initialQuery - Initial search query
 * @param {boolean} isInSearchDrawer - Whether the hook is being used in the search drawer
 * @returns {object} Search state and handlers
 */
const useSearchWithVoice = (initialQuery: string = '', isInSearchDrawer: boolean = false) => {
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery || '');
  const inputRef = useRef<HTMLInputElement>(null);

  // Update search query when initialQuery changes
  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);

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
    inputRef,
    onSearchQueryChange,
    onClearClicked,
    isInSearchDrawer,
  };
};

export default useSearchWithVoice;

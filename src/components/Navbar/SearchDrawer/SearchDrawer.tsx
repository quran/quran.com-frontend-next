/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable max-lines */
/* eslint-disable react/no-multi-comp */
import React, { RefObject, useCallback, useEffect, useMemo } from 'react';

import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import SearchDrawerHeader from './Header';

import { getNewSearchResults } from '@/api';
import DataFetcher from '@/components/DataFetcher';
import Drawer, { DrawerType } from '@/components/Navbar/Drawer';
import Spinner from '@/dls/Spinner/Spinner';
import { useToast } from '@/dls/Toast/Toast';
import useDebounce from '@/hooks/useDebounce';
import useFocus from '@/hooks/useFocusElement';
import useSearchWithVoice from '@/hooks/useSearchWithVoice';
import { selectNavbar, setIsSearchDrawerOpen } from '@/redux/slices/navbar';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import SearchService from '@/types/Search/SearchService';
import SearchQuerySource from '@/types/SearchQuerySource';
import { makeNewSearchResultsUrl } from '@/utils/apiPaths';
import { areArraysEqual } from '@/utils/array';
import { logButtonClick, logTextSearchQuery } from '@/utils/eventLogger';
import { addToSearchHistory, getQuickSearchQuery } from '@/utils/search';
import { useHandleMicError } from '@/utils/voice-search-errors';
import { SearchResponse } from 'types/ApiResponses';

const SearchBodyContainer = dynamic(() => import('@/components/Search/SearchBodyContainer'), {
  ssr: false,
  loading: () => <Spinner />,
});

const DEBOUNCING_PERIOD_MS = 1000;

const SearchDrawer: React.FC = () => {
  const { t } = useTranslation('common');
  const toast = useToast();
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual) as string[];
  const [focusInput, searchInputRef]: [() => void, RefObject<HTMLInputElement>] = useFocus();
  const { searchQuery, setSearchQuery } = useSearchWithVoice('', true);

  const isOpen = useSelector(selectNavbar, shallowEqual).isSearchDrawerOpen;
  const dispatch = useDispatch();
  // Debounce search query to avoid having to call the API on every type. The API will be called once the user stops typing.
  const debouncedSearchQuery = useDebounce<string>(searchQuery, DEBOUNCING_PERIOD_MS);

  // once the drawer is open, focus the input field
  useEffect(() => {
    if (isOpen) {
      focusInput();
    }
  }, [isOpen, focusInput]);

  // Handle microphone permission errors
  const handleMicError = useHandleMicError(toast, t);

  // Ensure the drawer stays open when the search query changes
  useEffect(() => {
    if (searchQuery && isOpen) {
      // Make sure the drawer stays open when typing
      dispatch({ type: setIsSearchDrawerOpen.type, payload: true });
    }
  }, [searchQuery, isOpen, dispatch]);

  // Log search query when it changes
  useEffect(() => {
    if (debouncedSearchQuery) {
      addToSearchHistory(dispatch, debouncedSearchQuery, SearchQuerySource.SearchDrawer);
      logTextSearchQuery(debouncedSearchQuery, SearchQuerySource.SearchDrawer);
    }
  }, [debouncedSearchQuery, dispatch]);

  const resetQueryAndResults = () => {
    logButtonClick('search_drawer_clear_input');
    // reset the search query
    setSearchQuery('');
  };

  /**
   * Handle when the search query is changed.
   *
   * @param {React.FormEvent<HTMLInputElement>} event
   * @returns {void}
   */
  const onSearchQueryChange = (event: React.FormEvent<HTMLInputElement>): void => {
    const newSearchQuery = event.currentTarget.value;
    if (!newSearchQuery) {
      resetQueryAndResults();
    } else {
      setSearchQuery(newSearchQuery);
    }
  };

  /**
   * When the keyword is clicked, we move the cursor to the end of
   * the input field after setting its value.
   *
   * @param {string} keyword
   */
  const onSearchKeywordClicked = useCallback(
    (keyword: string) => {
      const end = keyword.length;
      setSearchQuery(keyword);
      searchInputRef.current.setSelectionRange(end, end);
      focusInput();
    },
    [setSearchQuery, searchInputRef, focusInput],
  );

  const quickSearchQuery = useMemo(() => {
    return getQuickSearchQuery(debouncedSearchQuery, 10, selectedTranslations);
  }, [debouncedSearchQuery, selectedTranslations]);

  /**
   * Custom fetcher for search results
   */
  const searchFetcher = useCallback(() => {
    if (!debouncedSearchQuery) return null;
    return getNewSearchResults(quickSearchQuery).then((response) => ({
      ...response,
      service: SearchService.KALIMAT,
    }));
  }, [debouncedSearchQuery, quickSearchQuery]);

  /**
   * Render function for DataFetcher
   */
  const renderSearchResults = useCallback(
    (searchResult: SearchResponse) => {
      return (
        <SearchBodyContainer
          onSearchKeywordClicked={onSearchKeywordClicked}
          searchQuery={searchQuery}
          searchResult={searchResult}
          isSearching={false}
          hasError={false}
          shouldSuggestFullSearchWhenNoResults
          source={SearchQuerySource.SearchDrawer}
        />
      );
    },
    [searchQuery, onSearchKeywordClicked],
  );

  /**
   * Loading component for DataFetcher
   */
  const renderLoading = useCallback(() => {
    return (
      <SearchBodyContainer
        onSearchKeywordClicked={onSearchKeywordClicked}
        searchQuery={searchQuery}
        searchResult={null}
        isSearching
        hasError={false}
        shouldSuggestFullSearchWhenNoResults
        source={SearchQuerySource.SearchDrawer}
      />
    );
  }, [searchQuery, onSearchKeywordClicked]);

  return (
    <Drawer
      id="search-drawer"
      type={DrawerType.Search}
      header={
        <SearchDrawerHeader
          onSearchQueryChange={onSearchQueryChange}
          resetQueryAndResults={resetQueryAndResults}
          inputRef={searchInputRef}
          isSearching={false}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onMicError={handleMicError}
        />
      }
    >
      {isOpen && (
        <DataFetcher
          queryKey={debouncedSearchQuery ? makeNewSearchResultsUrl(quickSearchQuery) : null}
          render={renderSearchResults}
          fetcher={searchFetcher}
          loading={renderLoading}
        />
      )}
    </Drawer>
  );
};

export default SearchDrawer;

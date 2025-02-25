/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable max-lines */
/* eslint-disable react/no-multi-comp */
import React, { RefObject, useEffect, useState } from 'react';

import dynamic from 'next/dynamic';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import SearchDrawerHeader from './Header';

import { getNewSearchResults } from '@/api';
import Drawer, { DrawerType } from '@/components/Navbar/Drawer';
import Spinner from '@/dls/Spinner/Spinner';
import useDebounce from '@/hooks/useDebounce';
import useFocus from '@/hooks/useFocusElement';
import { selectNavbar } from '@/redux/slices/navbar';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import SearchService from '@/types/Search/SearchService';
import SearchQuerySource from '@/types/SearchQuerySource';
import { areArraysEqual } from '@/utils/array';
import { logButtonClick, logTextSearchQuery } from '@/utils/eventLogger';
import { addToSearchHistory, getQuickSearchQuery } from '@/utils/search';
import { SearchResponse } from 'types/ApiResponses';

const SearchBodyContainer = dynamic(() => import('@/components/Search/SearchBodyContainer'), {
  ssr: false,
  loading: () => <Spinner />,
});

const DEBOUNCING_PERIOD_MS = 1000;

const SearchDrawer: React.FC = () => {
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual) as string[];
  const [focusInput, searchInputRef]: [() => void, RefObject<HTMLInputElement>] = useFocus();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const isOpen = useSelector(selectNavbar, shallowEqual).isSearchDrawerOpen;
  const dispatch = useDispatch();
  const [isSearching, setIsSearching] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResponse>(null);
  // Debounce search query to avoid having to call the API on every type. The API will be called once the user stops typing.
  const debouncedSearchQuery = useDebounce<string>(searchQuery, DEBOUNCING_PERIOD_MS);
  // once the drawer is open, focus the input field
  useEffect(() => {
    if (isOpen) {
      focusInput();
    }
  }, [isOpen, focusInput]);

  useEffect(() => {
    // only when the search query has a value we call the API.
    if (debouncedSearchQuery) {
      addToSearchHistory(dispatch, debouncedSearchQuery, SearchQuerySource.SearchDrawer);
      setIsSearching(true);
      logTextSearchQuery(debouncedSearchQuery, SearchQuerySource.SearchDrawer);
      getNewSearchResults(getQuickSearchQuery(debouncedSearchQuery, 10, selectedTranslations))
        .then((response) => {
          setSearchResult({
            ...response,
            service: SearchService.KALIMAT,
          });
        })
        .catch(() => {
          setHasError(true);
        })
        .finally(() => {
          setIsSearching(false);
        });
    }
  }, [debouncedSearchQuery, selectedTranslations, dispatch]);

  const resetQueryAndResults = () => {
    logButtonClick('search_drawer_clear_input');
    // reset the search query
    setSearchQuery('');
    // reset the result
    setSearchResult(null);
    // reset the error
    setHasError(false);
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
  const onSearchKeywordClicked = (keyword: string) => {
    const end = keyword.length;
    setSearchQuery(keyword);
    searchInputRef.current.setSelectionRange(end, end);
    focusInput();
  };

  return (
    <Drawer
      type={DrawerType.Search}
      header={
        <SearchDrawerHeader
          onSearchQueryChange={onSearchQueryChange}
          resetQueryAndResults={resetQueryAndResults}
          inputRef={searchInputRef}
          isSearching={isSearching}
          searchQuery={searchQuery}
        />
      }
    >
      <div>
        {isOpen && (
          <SearchBodyContainer
            onSearchKeywordClicked={onSearchKeywordClicked}
            searchQuery={searchQuery}
            searchResult={searchResult}
            isSearching={isSearching}
            hasError={hasError}
            shouldSuggestFullSearchWhenNoResults
            source={SearchQuerySource.SearchDrawer}
          />
        )}
      </div>
    </Drawer>
  );
};

export default SearchDrawer;

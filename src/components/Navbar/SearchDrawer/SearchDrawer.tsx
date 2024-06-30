/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable max-lines */
/* eslint-disable react/no-multi-comp */
import React, { RefObject, useCallback, useEffect, useRef, useState } from 'react';

import dynamic from 'next/dynamic';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import SearchDrawerHeader from './Header';

import Drawer, { DrawerType } from '@/components/Navbar/Drawer';
import Spinner from '@/dls/Spinner/Spinner';
import useDebounce from '@/hooks/useDebounce';
import useFocus from '@/hooks/useFocusElement';
import { selectNavbar } from '@/redux/slices/navbar';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import { addSearchHistoryRecord } from '@/redux/slices/Search/search';
import { selectIsSearchDrawerVoiceFlowStarted } from '@/redux/slices/voiceSearch';
import { SearchMode } from '@/types/Search/SearchRequestParams';
import SearchService from '@/types/Search/SearchService';
import SearchQuerySource from '@/types/SearchQuerySource';
import { areArraysEqual } from '@/utils/array';
import {
  logButtonClick,
  logEmptySearchResults,
  logSearchResults,
  logTextSearchQuery,
} from '@/utils/eventLogger';
import { getNewSearchResults, getSearchResults } from 'src/api';
import { SearchResponse } from 'types/ApiResponses';

const SearchBodyContainer = dynamic(() => import('@/components/Search/SearchBodyContainer'), {
  ssr: false,
  loading: () => <Spinner />,
});
const VoiceSearchBodyContainer = dynamic(
  () => import('@/components/TarteelVoiceSearch/BodyContainer'),
  {
    ssr: false,
    loading: () => <Spinner />,
  },
);

const PAGE_SIZE = 10;
const DEBOUNCING_PERIOD_MS = 1000;

const SearchDrawer: React.FC = () => {
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual);
  const [focusInput, searchInputRef]: [() => void, RefObject<HTMLInputElement>] = useFocus();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const isOpen = useSelector(selectNavbar, shallowEqual).isSearchDrawerOpen;
  const dispatch = useDispatch();
  const [isSearching, setIsSearching] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResponse>(null);
  const isVoiceSearchFlowStarted = useSelector(selectIsSearchDrawerVoiceFlowStarted, shallowEqual);
  // Debounce search query to avoid having to call the API on every type. The API will be called once the user stops typing.
  const debouncedSearchQuery = useDebounce<string>(searchQuery, DEBOUNCING_PERIOD_MS);
  // once the drawer is open, focus the input field
  useEffect(() => {
    if (isOpen) {
      focusInput();
    }
  }, [isOpen, focusInput]);

  /**
   * Call BE to fetch the results using the passed filters.
   *
   * @param {string} query
   * @param {number} page
   * @param {string} language
   */
  const getResults = useCallback(
    (query: string, page: number) => {
      setIsSearching(true);
      logTextSearchQuery(query, SearchQuerySource.SearchPage);
      getSearchResults({
        query,
        size: PAGE_SIZE,
        page,
        ...(!!selectedTranslations?.length && {
          filterTranslations: selectedTranslations.join(','),
        }), // translations will be included only when there is a selected translation
      })
        .then(async (response) => {
          if (response.status === 500) {
            setHasError(true);
          } else {
            setSearchResult({ ...response, service: SearchService.QDC });
            const noQdcResults =
              response.pagination.totalRecords === 0 && !response.result.navigation.length;
            // if there is no navigations nor verses in the response
            if (noQdcResults) {
              logEmptySearchResults({
                query,
                source: SearchQuerySource.SearchPage,
                service: SearchService.QDC,
              });
              const kalimatResponse = await getNewSearchResults({
                mode: SearchMode.Advanced,
                query,
                size: PAGE_SIZE,
                page,
                exactMatchesOnly: 0,
                // translations will be included only when there is a selected translation
                ...(!!selectedTranslations?.length && {
                  filterTranslations: selectedTranslations.join(','),
                  translationFields: 'resource_name',
                }), // translations will be included only when there is a selected translation
              });
              setSearchResult({
                ...kalimatResponse,
                service: SearchService.KALIMAT,
              });
              if (kalimatResponse.pagination.totalRecords === 0) {
                logEmptySearchResults({
                  query,
                  source: SearchQuerySource.SearchPage,
                  service: SearchService.KALIMAT,
                });
              } else {
                logSearchResults({
                  query,
                  source: SearchQuerySource.SearchPage,
                  service: SearchService.KALIMAT,
                });
              }
            }
          }
        })
        .catch(() => {
          setHasError(true);
        })
        .finally(() => {
          setIsSearching(false);
        });
    },
    [selectedTranslations],
  );

  // a ref to know whether this is the initial search request made when the user loads the page or not
  const isInitialSearch = useRef(true);

  // This useEffect is triggered when the debouncedSearchQuery value changes
  useEffect(() => {
    // only when the search query has a value we call the API.
    if (debouncedSearchQuery) {
      // we don't want to reset pagination when the user reloads the page with a ?page={number} in the url query
      if (!isInitialSearch.current) {
        setCurrentPage(1);
      }

      dispatch({ type: addSearchHistoryRecord.type, payload: debouncedSearchQuery });
      logTextSearchQuery(debouncedSearchQuery, SearchQuerySource.SearchDrawer);

      getResults(
        debouncedSearchQuery,
        // if it is the initial search request, use the page number in the url, otherwise, reset it
        isInitialSearch.current ? currentPage : 1,
      );

      // if it was the initial request, update the ref
      if (isInitialSearch.current) {
        isInitialSearch.current = false;
      }
    }
  }, [debouncedSearchQuery, selectedTranslations, dispatch, currentPage, getResults]);

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
      hideCloseButton={isVoiceSearchFlowStarted}
      type={DrawerType.Search}
      header={
        <SearchDrawerHeader
          isVoiceFlowStarted={isVoiceSearchFlowStarted}
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
          <>
            {isVoiceSearchFlowStarted ? (
              <VoiceSearchBodyContainer />
            ) : (
              <SearchBodyContainer
                onSearchResultClicked={() => searchInputRef?.current?.blur()}
                onSearchKeywordClicked={onSearchKeywordClicked}
                searchQuery={searchQuery}
                searchResult={searchResult}
                isSearching={isSearching}
                hasError={hasError}
              />
            )}
          </>
        )}
      </div>
    </Drawer>
  );
};

export default SearchDrawer;

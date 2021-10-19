/* eslint-disable react/no-multi-comp */
import React, { useEffect, useState, RefObject } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import dynamic from 'next/dynamic';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import DrawerSearchIcon from './Buttons/DrawerSearchIcon';
import styles from './SearchDrawer.module.scss';

import { getSearchResults } from 'src/api';
import Spinner from 'src/components/dls/Spinner/Spinner';
import Drawer, { DrawerType } from 'src/components/Navbar/Drawer';
import useDebounce from 'src/hooks/useDebounce';
import useElementComputedPropertyValue from 'src/hooks/useElementComputedPropertyValue';
import useFocus from 'src/hooks/useFocusElement';
import { selectNavbar } from 'src/redux/slices/navbar';
import { selectSelectedTranslations } from 'src/redux/slices/QuranReader/translations';
import { addSearchHistoryRecord } from 'src/redux/slices/Search/search';
import { areArraysEqual } from 'src/utils/array';
import { SearchResponse } from 'types/ApiResponses';

const SearchBodyContainer = dynamic(() => import('src/components/Search/SearchBodyContainer'), {
  ssr: false,
  loading: () => <Spinner />,
});

const DEBOUNCING_PERIOD_MS = 1000;

const SearchDrawer: React.FC = () => {
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual);
  const [focusInput, searchInputRef]: [() => void, RefObject<HTMLInputElement>] = useFocus();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const isOpen = useSelector(selectNavbar, shallowEqual).isSearchDrawerOpen;
  const { lang } = useTranslation();
  const dispatch = useDispatch();
  const [isSearching, setIsSearching] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResponse>(null);
  // we detect whether the user is inputting a right-to-left text or not so we can change the layout accordingly
  const isRTLInput = useElementComputedPropertyValue(searchInputRef, 'direction') === 'rtl';
  // Debounce search query to avoid having to call the API on every type. The API will be called once the user stops typing.
  const debouncedSearchQuery = useDebounce<string>(searchQuery, DEBOUNCING_PERIOD_MS);
  // once the drawer is open, focus the input field
  useEffect(() => {
    if (isOpen) {
      focusInput();
    }
  }, [isOpen, focusInput]);

  // This useEffect is triggered when the debouncedSearchQuery value changes
  useEffect(() => {
    // only when the search query has a value we call the API.
    if (debouncedSearchQuery) {
      dispatch({ type: addSearchHistoryRecord.type, payload: debouncedSearchQuery });
      setIsSearching(true);
      getSearchResults({
        query: debouncedSearchQuery,
        filterLanguages: lang,
        ...(selectedTranslations &&
          !!selectedTranslations.length && {
            filterTranslations: selectedTranslations.join(','),
          }),
      })
        .then((response) => {
          if (response.status === 500) {
            setHasError(true);
          } else {
            setSearchResult(response);
          }
        })
        .catch(() => {
          setHasError(true);
        })
        .finally(() => {
          setIsSearching(false);
        });
    } else {
      // reset the result
      setSearchResult(null);
    }
  }, [lang, debouncedSearchQuery, selectedTranslations, dispatch]);

  const resetQueryAndResults = () => {
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
        <>
          <DrawerSearchIcon />
          <div
            className={classNames(styles.searchInputContainer, {
              [styles.searchInputContainerRTL]: isRTLInput,
            })}
          >
            <input
              className={styles.searchInput}
              type="text"
              ref={searchInputRef}
              dir="auto"
              placeholder="Search"
              onChange={onSearchQueryChange}
              value={searchQuery}
              disabled={isSearching}
            />
            {searchQuery && (
              <button type="button" className={styles.clear} onClick={resetQueryAndResults}>
                Clear
              </button>
            )}
          </div>
        </>
      }
    >
      {isOpen && (
        <SearchBodyContainer
          onSearchKeywordClicked={onSearchKeywordClicked}
          searchQuery={searchQuery}
          searchResult={searchResult}
          isSearching={isSearching}
          hasError={hasError}
        />
      )}
    </Drawer>
  );
};

export default SearchDrawer;

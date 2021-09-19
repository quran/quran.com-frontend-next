/* eslint-disable max-lines */
import React, { useCallback, useEffect, useState, RefObject, useRef } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import DrawerCloseButton from './Buttons/DrawerCloseButton';
import DrawerSearchIcon from './Buttons/DrawerSearchIcon';
import NoResults from './NoResults';
import PreInput from './PreInput';
import styles from './SearchDrawer.module.scss';

import { getSearchResults } from 'src/api';
import Spinner, { SpinnerSize } from 'src/components/dls/Spinner/Spinner';
import SearchResults from 'src/components/Search/SearchResults';
import useDebounce from 'src/hooks/useDebounce';
import useElementComputedPropertyValue from 'src/hooks/useElementComputedPropertyValue';
import useFocus from 'src/hooks/useFocusElement';
import useKeyPressedDetector from 'src/hooks/useKeyPressedDetector';
import useOutsideClickDetector from 'src/hooks/useOutsideClickDetector';
import { selectNavbar, setIsSearchDrawerOpen } from 'src/redux/slices/navbar';
import { selectSelectedTranslations } from 'src/redux/slices/QuranReader/translations';
import { addSearchHistoryRecord } from 'src/redux/slices/Search/search';
import { areArraysEqual } from 'src/utils/array';
import { getSearchQueryNavigationUrl } from 'src/utils/navigation';
import { SearchResponse } from 'types/ApiResponses';

const DEBOUNCING_PERIOD_MS = 1000;

const SearchDrawer: React.FC = () => {
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual);
  const drawerRef = useRef(null);
  const [focusInput, searchInputRef]: [() => void, RefObject<HTMLInputElement>] = useFocus();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const isOpen = useSelector(selectNavbar, shallowEqual).isSearchDrawerOpen;
  const { lang } = useTranslation();
  const dispatch = useDispatch();
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResponse>(null);
  // we detect whether the user is inputting a right-to-left text or not so we can change the layout accordingly
  const isRTLInput = useElementComputedPropertyValue(searchInputRef, 'direction') === 'rtl';
  // Debounce search query to avoid having to call the API on every type. The API will be called once the user stops typing.
  const debouncedSearchQuery = useDebounce<string>(searchQuery, DEBOUNCING_PERIOD_MS);
  const isEscapeKeyPressed = useKeyPressedDetector('Escape', isOpen);

  const closeSearchDrawer = useCallback(() => {
    dispatch({ type: setIsSearchDrawerOpen.type, payload: false });
  }, [dispatch]);

  // listen to any changes of escape key being pressed.
  useEffect(() => {
    // if we allow closing the modal by keyboard and also ESCAPE key has been pressed, we close the modal.
    if (isEscapeKeyPressed === true) {
      closeSearchDrawer();
    }
  }, [closeSearchDrawer, isEscapeKeyPressed]);

  useOutsideClickDetector(drawerRef, closeSearchDrawer, isOpen);

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

  // Hide navbar after successful navigation
  useEffect(() => {
    router.events.on('routeChangeComplete', () => {
      if (isOpen) {
        closeSearchDrawer();
      }
    });
  }, [closeSearchDrawer, router.events, isOpen]);

  const isEmptyResponse =
    searchResult &&
    searchResult.pagination.totalRecords === 0 &&
    !searchResult.result.navigation.length;
  const isPreInputLayout =
    !searchQuery || isSearching || hasError || (!isSearching && !hasError && isEmptyResponse);
  const searchUrl = getSearchQueryNavigationUrl(searchQuery);

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
    <div
      className={classNames(styles.container, { [styles.containerOpen]: isOpen })}
      ref={drawerRef}
    >
      <div className={styles.header}>
        <div className={styles.headerContentContainer}>
          <div className={styles.headerContent}>
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
            <DrawerCloseButton onClick={closeSearchDrawer} />
          </div>
        </div>
      </div>
      <div
        className={classNames(styles.bodyContainer, {
          [styles.internalContainer]: isPreInputLayout,
        })}
      >
        {!searchQuery ? (
          <PreInput onSearchKeywordClicked={onSearchKeywordClicked} />
        ) : (
          <>
            {isSearching ? (
              <Spinner size={SpinnerSize.Large} />
            ) : (
              <>
                {hasError && <div>Something went wrong, please try again!</div>}
                {!hasError && searchResult && (
                  <>
                    {isEmptyResponse ? (
                      <NoResults searchQuery={searchQuery} searchUrl={searchUrl} />
                    ) : (
                      <SearchResults
                        searchResult={searchResult}
                        searchQuery={debouncedSearchQuery}
                      />
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchDrawer;

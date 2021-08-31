import React, { useCallback, useEffect, useState, RefObject } from 'react';
import { selectNavbar, setIsSearchDrawerOpen } from 'src/redux/slices/navbar';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import useElementComputedPropertyValue from 'src/hooks/useElementComputedPropertyValue';
import { getSearchResults } from 'src/api';
import { SearchResponse } from 'types/APIResponses';
import useDebounce from 'src/hooks/useDebounce';
import classNames from 'classnames';
import SearchResults from 'src/components/Search/SearchResults';
import useFocus from 'src/hooks/useFocusElement';
import { getSearchQueryNavigationUrl } from 'src/utils/navigation';
import Spinner, { SpinnerSize } from 'src/components/dls/Spinner/Spinner';
import styles from './SearchDrawer.module.scss';
import PreInput from './PreInput';
import NoResults from './NoResults';
import DrawerCloseButton from './Buttons/DrawerCloseButton';
import DrawerSearchButton from './Buttons/DrawerSearchButton';

const DEBOUNCING_PERIOD_MS = 1000;

const SearchDrawer: React.FC = () => {
  const [focusInput, searchInputRef]: [() => void, RefObject<HTMLInputElement>] = useFocus();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const isOpen = useSelector(selectNavbar).isSearchDrawerOpen;
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
      setIsSearching(true);
      getSearchResults({
        query: debouncedSearchQuery,
        language: lang,
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
  }, [lang, debouncedSearchQuery]);

  const resetQueryAndResults = () => {
    // reset the search query
    setSearchQuery('');
    // reset the result
    setSearchResult(null);
    // reset the error
    setHasError(false);
  };

  const closeSearchDrawer = useCallback(() => {
    dispatch({ type: setIsSearchDrawerOpen.type, payload: false });
  }, [dispatch]);

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

  const isPreInputLayout =
    !searchQuery ||
    isSearching ||
    hasError ||
    (!isSearching && !hasError && searchResult && searchResult.pagination.totalRecords === 0);
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
    <div className={classNames(styles.container, { [styles.containerOpen]: isOpen })}>
      <div className={styles.header}>
        <div className={styles.headerContentContainer}>
          <div className={styles.headerContent}>
            <DrawerSearchButton disabled={!searchQuery} href={searchUrl} />
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
              <div className={styles.spinnerContainer}>
                <Spinner size={SpinnerSize.Large} />
              </div>
            ) : (
              <>
                {hasError && <div>Something went wrong, please try again!</div>}
                {!hasError && searchResult && (
                  <>
                    {searchResult.pagination.totalRecords === 0 ? (
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

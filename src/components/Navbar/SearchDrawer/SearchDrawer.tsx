import React, { useCallback, useEffect, useState, useRef } from 'react';
import { selectNavbar, setIsSearchDrawerOpen } from 'src/redux/slices/navbar';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';
import useElementComputedPropertyValue from 'src/hooks/useElementComputedPropertyValue';
import { getSearchResults } from 'src/api';
import { SearchResponse } from 'types/APIResponses';
import useDebounce from 'src/hooks/useDebounce';
import classNames from 'classnames';
import IconClose from '../../../../public/icons/close.svg';
import IconSearch from '../../../../public/icons/search.svg';
import SearchDrawerBody from './SearchDrawerBody';
import styles from './SearchDrawer.module.scss';

const DEBOUNCING_PERIOD_MS = 1000;

const SearchDrawer: React.FC = () => {
  const searchInputRef = useRef<HTMLInputElement>(null);
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

  return (
    <div className={classNames(styles.container, { [styles.containerOpen]: isOpen })}>
      <div className={styles.header}>
        <div className={styles.headerContentContainer}>
          <div className={styles.headerContent}>
            <Button
              shape={ButtonShape.Circle}
              variant={ButtonVariant.Ghost}
              disabled={!searchQuery}
              href={`/search?query=${searchQuery}`}
            >
              <IconSearch />
            </Button>
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
            <Button
              shape={ButtonShape.Circle}
              variant={ButtonVariant.Ghost}
              onClick={closeSearchDrawer}
            >
              <IconClose />
            </Button>
          </div>
        </div>
      </div>
      <SearchDrawerBody
        hasError={hasError}
        searchResult={searchResult}
        isSearching={isSearching}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default SearchDrawer;

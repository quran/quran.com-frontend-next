/* eslint-disable max-lines */
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';

import classNames from 'classnames';
import { GetStaticProps, NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

import IconClose from '../../public/icons/close.svg';

import styles from './search.module.scss';

import { getAvailableLanguages, getAvailableTranslations, getSearchResults } from 'src/api';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from 'src/components/dls/Button/Button';
import NextSeoHead from 'src/components/NextSeoHead';
import LanguagesFilter from 'src/components/Search/LanguagesFilter';
import SearchResults from 'src/components/Search/SearchResults';
import TranslationsFilter from 'src/components/Search/TranslationsFilter';
import useAddQueryParamsToUrl from 'src/hooks/useAddQueryParamsToUrl';
import useDebounce from 'src/hooks/useDebounce';
import useElementComputedPropertyValue from 'src/hooks/useElementComputedPropertyValue';
import { selectSelectedTranslations } from 'src/redux/slices/QuranReader/translations';
import { areArraysEqual } from 'src/utils/array';
import { SearchResponse } from 'types/APIResponses';
import AvailableLanguage from 'types/AvailableLanguage';
import AvailableTranslation from 'types/AvailableTranslation';

const PAGE_SIZE = 20;
const DEBOUNCING_PERIOD_MS = 1000;

type SearchProps = {
  languages: AvailableLanguage[];
  translations: AvailableTranslation[];
};

const Search: NextPage<SearchProps> = ({ languages, translations }) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { lang } = useTranslation();
  const userTranslations = useSelector(selectSelectedTranslations, areArraysEqual);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedLanguages, setSelectedLanguages] = useState<string>(lang);
  const [selectedTranslations, setSelectedTranslations] = useState<string>(() =>
    userTranslations.join(','),
  );
  const [isSearching, setIsSearching] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResponse>(null);
  // we detect whether the user is inputting a right-to-left text or not so we can change the layout accordingly
  const isRTLInput = useElementComputedPropertyValue(searchInputRef, 'direction') === 'rtl';
  // Debounce search query to avoid having to call the API on every type. The API will be called once the user stops typing.
  const debouncedSearchQuery = useDebounce<string>(searchQuery, DEBOUNCING_PERIOD_MS);
  // the query params that we want added to the url
  const queryParams = useMemo(
    () => ({
      page: currentPage,
      languages: selectedLanguages,
      query: debouncedSearchQuery,
      translations: selectedTranslations,
    }),
    [currentPage, debouncedSearchQuery, selectedLanguages, selectedTranslations],
  );
  useAddQueryParamsToUrl('/search', queryParams);

  // We need this since pages that are statically optimized will be hydrated
  // without their route parameters provided, i.e query will be an empty object ({}).
  // After hydration, Next.js will trigger an update to provide the route parameters
  // in the query object. @see https://nextjs.org/docs/routing/dynamic-routes#caveats
  useEffect(() => {
    if (router.isReady) {
      if (router.query.query) {
        setSearchQuery(router.query.query as string);
      }
      if (router.query.page) {
        setCurrentPage(Number(router.query.page));
      }
      if (router.query.languages) {
        setSelectedLanguages(router.query.languages as string);
      }
      if (router.query.translations) {
        setSelectedTranslations(router.query.translations as string);
      }
    }
  }, [router]);

  /**
   * Handle when the search query is changed.
   *
   * @param {React.FormEvent<HTMLInputElement>} event
   * @returns {void}
   */
  const onSearchQueryChange = (event: React.FormEvent<HTMLInputElement>): void => {
    const newSearchQuery = event.currentTarget.value;
    if (!newSearchQuery) {
      setSearchQuery('');
    } else {
      setSearchQuery(newSearchQuery);
    }
  };

  const onClearClicked = () => {
    setSearchQuery('');
  };

  /**
   * Call BE to fetch the results using the passed filters.
   *
   * @param {string} query
   * @param {number} page
   * @param {string} translation
   * @param {string} language
   */
  const getResults = useCallback(
    (query: string, page: number, translation: string, language: string) => {
      setIsSearching(true);
      getSearchResults({
        query,
        filterLanguages: language,
        size: PAGE_SIZE,
        page,
        ...(translation && { filterTranslations: translation }), // translations will be included only when there is a selected translation
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
    },
    [],
  );

  // listen to any changes in the API params and call BE on change.
  useEffect(() => {
    // only when the search query has a value we call the API.
    if (debouncedSearchQuery) {
      getResults(debouncedSearchQuery, currentPage, selectedTranslations, selectedLanguages);
    }
  }, [currentPage, debouncedSearchQuery, getResults, selectedLanguages, selectedTranslations]);

  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  /**
   * Handle when the selected language changes.
   *
   * @param {string} languageIsoCode
   */
  const onLanguageChange = useCallback((languageIsoCodes: string[]) => {
    // convert the array into a string
    setSelectedLanguages(languageIsoCodes.join(','));
  }, []);

  const onTranslationChange = useCallback((translationIds: string[]) => {
    // convert the array into a string
    setSelectedTranslations(translationIds.join(','));
    // reset the current page since most probable the results will change.
    setCurrentPage(1);
  }, []);

  const isEmptyResponse =
    searchResult &&
    searchResult.pagination.totalRecords === 0 &&
    !searchResult.result.navigation.length;
  return (
    <>
      <NextSeoHead title={debouncedSearchQuery} />
      <div className={styles.pageContainer}>
        <p className={styles.header}>Search</p>
        <div
          className={classNames(styles.searchInputContainer, {
            [styles.rtlFlexDirection]: isRTLInput,
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
            <Button
              tooltip="Clear"
              shape={ButtonShape.Circle}
              variant={ButtonVariant.Ghost}
              size={ButtonSize.Small}
              onClick={onClearClicked}
            >
              <IconClose />
            </Button>
          )}
        </div>
        <div className={styles.pageBody}>
          <div className={styles.filtersContainer}>
            <p className={styles.boldHeader}>Filters</p>
            <LanguagesFilter
              languages={languages}
              selectedLanguages={selectedLanguages}
              onLanguageChange={onLanguageChange}
            />
            <TranslationsFilter
              translations={translations}
              selectedTranslations={selectedTranslations}
              onTranslationChange={onTranslationChange}
            />
          </div>
          <div className={styles.bodyContainer}>
            {isSearching && <div>Searching...</div>}
            {!isSearching && hasError && <div>Something went wrong, please try again!</div>}
            {!isSearching && !hasError && searchResult && (
              <>
                {isEmptyResponse ? (
                  <p>No results found!</p>
                ) : (
                  <SearchResults
                    searchResult={searchResult}
                    searchQuery={debouncedSearchQuery}
                    isSearchDrawer={false}
                    currentPage={currentPage}
                    onPageChange={onPageChange}
                    pageSize={PAGE_SIZE}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const [availableLanguagesResponse, availableTranslationsResponse] = await Promise.all([
    getAvailableLanguages(locale),
    getAvailableTranslations(locale),
  ]);

  let translations = [];
  let languages = [];
  if (availableLanguagesResponse.status !== 500) {
    const { languages: responseLanguages } = availableLanguagesResponse;
    languages = responseLanguages;
  }
  if (availableTranslationsResponse.status !== 500) {
    const { translations: responseTranslations } = availableTranslationsResponse;
    translations = responseTranslations;
  }

  return {
    props: {
      languages,
      translations,
    },
  };
};

export default Search;

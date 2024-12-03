/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable max-lines */
import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import styles from './search.module.scss';

import { getAvailableLanguages } from '@/api';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import SearchBodyContainer from '@/components/Search/SearchBodyContainer';
import Input, { InputVariant } from '@/dls/Forms/Input';
import useAddQueryParamsToUrl from '@/hooks/useAddQueryParamsToUrl';
import useDebounce from '@/hooks/useDebounce';
import useFocus from '@/hooks/useFocusElement';
import SearchIcon from '@/icons/search.svg';
import { setInitialSearchQuery, setIsOpen } from '@/redux/slices/CommandBar/state';
import SearchQuerySource from '@/types/SearchQuerySource';
import { getAllChaptersData } from '@/utils/chapter';
import { logButtonClick, logEvent } from '@/utils/eventLogger';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl } from '@/utils/navigation';
import { addToSearchHistory, searchGetResults } from '@/utils/search';
import { SearchResponse } from 'types/ApiResponses';
import AvailableLanguage from 'types/AvailableLanguage';
import ChaptersData from 'types/ChaptersData';

const PAGE_SIZE = 10;
const DEBOUNCING_PERIOD_MS = 1000;

type SearchProps = {
  languages: AvailableLanguage[];
  chaptersData: ChaptersData;
};

const Search: NextPage<SearchProps> = (): JSX.Element => {
  const { t, lang } = useTranslation('common');
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [focusInput, searchInputRef]: [() => void, RefObject<HTMLInputElement>] = useFocus();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedLanguages, setSelectedLanguages] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResponse>(null);
  // Debounce search query to avoid having to call the API on every type. The API will be called once the user stops typing.
  const debouncedSearchQuery = useDebounce<string>(searchQuery, DEBOUNCING_PERIOD_MS);
  const dispatch = useDispatch();
  // the query params that we want added to the url
  const queryParams = useMemo(
    () => ({
      page: currentPage,
      languages: selectedLanguages,
      q: debouncedSearchQuery,
    }),
    [currentPage, debouncedSearchQuery, selectedLanguages],
  );
  useAddQueryParamsToUrl('/search', queryParams);

  // We need this since pages that are statically optimized will be hydrated
  // without their route parameters provided, i.e query will be an empty object ({}).
  // After hydration, Next.js will trigger an update to provide the route parameters
  // in the query object. @see https://nextjs.org/docs/routing/dynamic-routes#caveats
  useEffect(() => {
    // we don't want to focus the main search input when the translation filter modal is open.
    if (router.isReady) {
      focusInput();
    }
  }, [focusInput, router]);

  useEffect(() => {
    if (router.query.q || router.query.query) {
      let query = router.query.q as string;
      if (router.query.query) {
        query = router.query.query as string;
      }
      setSearchQuery(query);
    }

    if (router.query.page) {
      setCurrentPage(Number(router.query.page));
    }
    if (router.query.languages) {
      setSelectedLanguages(router.query.languages as string);
    }
  }, [router.query.q, router.query.query, router.query.page, router.query.languages]);

  /**
   * Handle when the search query is changed.
   *
   * @param {string} newSearchQuery
   * @returns {void}
   */
  const onSearchQueryChange = (newSearchQuery: string): void => {
    dispatch({ type: setIsOpen.type, payload: true });
    dispatch({ type: setInitialSearchQuery.type, payload: newSearchQuery });
  };

  const onClearClicked = () => {
    logButtonClick('search_page_clear_query');
    setSearchQuery('');
  };

  /**
   * Call BE to fetch the results using the passed filters.
   *
   * @param {string} query
   * @param {number} page
   * @param {string} language
   */
  const getResults = useCallback((query: string, page: number, language: string) => {
    searchGetResults(
      SearchQuerySource.SearchPage,
      query,
      page,
      PAGE_SIZE,
      setIsSearching,
      setHasError,
      setSearchResult,
      language,
    );
  }, []);

  // a ref to know whether this is the initial search request made when the user loads the page or not
  const isInitialSearch = useRef(true);

  // listen to any changes in the API params and call BE on change.
  useEffect(() => {
    // only when the search query has a value we call the API.
    if (debouncedSearchQuery) {
      // we don't want to reset pagination when the user reloads the page with a ?page={number} in the url query
      if (!isInitialSearch.current) {
        setCurrentPage(1);
      }

      addToSearchHistory(dispatch, debouncedSearchQuery, SearchQuerySource.SearchPage);

      getResults(
        debouncedSearchQuery,
        // if it is the initial search request, use the page number in the url, otherwise, reset it
        isInitialSearch.current ? currentPage : 1,
        selectedLanguages,
      );

      // if it was the initial request, update the ref
      if (isInitialSearch.current) {
        isInitialSearch.current = false;
      }
    }
    // we don't want to run this effect when currentPage is changed
    // because we are already handeling this in onPageChange
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, getResults, selectedLanguages]);

  const onPageChange = (page: number) => {
    logEvent('search_page_number_change', { page });
    setCurrentPage(page);
    getResults(debouncedSearchQuery, page, selectedLanguages);
  };

  const onSearchKeywordClicked = useCallback((keyword: string) => {
    setSearchQuery(keyword);
  }, []);

  const navigationUrl = '/search';

  return (
    <>
      <NextSeoWrapper
        title={
          debouncedSearchQuery !== ''
            ? t('search:search-title', {
                searchQuery: debouncedSearchQuery,
              })
            : t('search:search')
        }
        description={t('search:search-desc')}
        canonical={getCanonicalUrl(lang, navigationUrl)}
        languageAlternates={getLanguageAlternates(navigationUrl)}
      />
      <div className={styles.pageContainer}>
        <div className={styles.headerOuterContainer}>
          <div className={styles.headerInnerContainer}>
            <Input
              id="searchQuery"
              prefix={<SearchIcon />}
              onChange={onSearchQueryChange}
              onClearClicked={onClearClicked}
              inputRef={searchInputRef}
              clearable
              value={searchQuery}
              disabled={isSearching}
              placeholder={t('search.title')}
              fixedWidth={false}
              variant={InputVariant.Main}
            />
          </div>
        </div>
        <div className={styles.pageBody}>
          <div className={styles.searchBodyContainer}>
            <SearchBodyContainer
              onSearchKeywordClicked={onSearchKeywordClicked}
              isSearchDrawer={false}
              searchQuery={debouncedSearchQuery}
              searchResult={searchResult}
              currentPage={currentPage}
              onPageChange={onPageChange}
              pageSize={PAGE_SIZE}
              isSearching={isSearching}
              hasError={hasError}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    const availableLanguagesResponse = await getAvailableLanguages(locale);

    let languages = [];
    if (availableLanguagesResponse.status !== 500) {
      const { languages: responseLanguages } = availableLanguagesResponse;
      languages = responseLanguages;
    }
    const chaptersData = await getAllChaptersData(locale);

    return {
      props: {
        chaptersData,
        languages,
      },
    };
  } catch (e) {
    return {
      props: {
        hasError: true,
      },
    };
  }
};

export default Search;

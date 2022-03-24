/* eslint-disable max-lines */
import React, { useState, useEffect, useMemo, useCallback } from 'react';

import { GetStaticProps, NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

import IconSearch from '../../public/icons/search.svg';

import styles from './search.module.scss';

import { getAvailableLanguages, getAvailableTranslations, getSearchResults } from 'src/api';
import Input from 'src/components/dls/Forms/Input';
import NextSeoWrapper from 'src/components/NextSeoWrapper';
import LanguagesFilter from 'src/components/Search/Filters/LanguagesFilter';
import TranslationsFilter from 'src/components/Search/Filters/TranslationsFilter';
import SearchBodyContainer from 'src/components/Search/SearchBodyContainer';
import DataContext from 'src/contexts/DataContext';
import useAddQueryParamsToUrl from 'src/hooks/useAddQueryParamsToUrl';
import useDebounce from 'src/hooks/useDebounce';
import { selectSelectedTranslations } from 'src/redux/slices/QuranReader/translations';
import { areArraysEqual } from 'src/utils/array';
import { getAllChaptersData } from 'src/utils/chapter';
import {
  logButtonClick,
  logEmptySearchResults,
  logEvent,
  logValueChange,
} from 'src/utils/eventLogger';
import { getLanguageAlternates } from 'src/utils/locale';
import { getCanonicalUrl } from 'src/utils/navigation';
import { SearchResponse } from 'types/ApiResponses';
import AvailableLanguage from 'types/AvailableLanguage';
import AvailableTranslation from 'types/AvailableTranslation';
import ChaptersData from 'types/ChaptersData';

const PAGE_SIZE = 10;
const DEBOUNCING_PERIOD_MS = 1000;

type SearchProps = {
  languages: AvailableLanguage[];
  translations: AvailableTranslation[];
  chaptersData: ChaptersData;
};

const Search: NextPage<SearchProps> = ({ languages, translations, chaptersData }) => {
  const { t, lang } = useTranslation('common');
  const router = useRouter();
  const userTranslations = useSelector(selectSelectedTranslations, areArraysEqual);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedLanguages, setSelectedLanguages] = useState<string>('');
  const [selectedTranslations, setSelectedTranslations] = useState<string>(() =>
    userTranslations.join(','),
  );
  const [isSearching, setIsSearching] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResponse>(null);
  // Debounce search query to avoid having to call the API on every type. The API will be called once the user stops typing.
  const debouncedSearchQuery = useDebounce<string>(searchQuery, DEBOUNCING_PERIOD_MS);
  // the query params that we want added to the url
  const queryParams = useMemo(
    () => ({
      page: currentPage,
      languages: selectedLanguages,
      q: debouncedSearchQuery,
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
      if (router.query.translations) {
        setSelectedTranslations(router.query.translations as string);
      }
    }
  }, [router]);

  /**
   * Handle when the search query is changed.
   *
   * @param {string} newSearchQuery
   * @returns {void}
   */
  const onSearchQueryChange = (newSearchQuery: string): void => {
    setSearchQuery(newSearchQuery || '');
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
            // if there is no navigations nor verses in the response
            if (response.pagination.totalRecords === 0 && !response.result.navigation.length) {
              logEmptySearchResults(query, 'search_page');
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
    logEvent('search_page_number_change');
    setCurrentPage(page);
  };

  /**
   * Handle when the selected language changes.
   *
   * @param {string} languageIsoCode
   */
  const onLanguageChange = useCallback((languageIsoCodes: string[]) => {
    // convert the array into a string
    setSelectedLanguages((prevLanguages) => {
      const newLanguages = languageIsoCodes.join(',');
      logValueChange('search_page_selected_languages', prevLanguages, newLanguages);
      return newLanguages;
    });
  }, []);

  const onTranslationChange = useCallback((translationIds: string[]) => {
    // convert the array into a string
    setSelectedTranslations((prevTranslationIds) => {
      const newTranslationIds = translationIds.join(',');
      logValueChange('search_page_selected_translations', prevTranslationIds, newTranslationIds);
      return newTranslationIds;
    });
    // reset the current page since most probable the results will change.
    setCurrentPage(1);
  }, []);

  const onSearchKeywordClicked = useCallback((keyword: string) => {
    setSearchQuery(keyword);
  }, []);

  const navigationUrl = '/search';

  return (
    <DataContext.Provider value={chaptersData}>
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
        <p className={styles.header}>{t('search.title')}</p>
        <Input
          id="searchQuery"
          prefix={<IconSearch />}
          onChange={onSearchQueryChange}
          onClearClicked={onClearClicked}
          clearable
          value={searchQuery}
          disabled={isSearching}
          placeholder={t('search.title')}
          fixedWidth={false}
        />
        <p className={styles.filtersHeader}>{t('search.filters')}</p>
        <div className={styles.filtersContainer}>
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
        <div className={styles.pageBody}>
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
    </DataContext.Provider>
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
  const chaptersData = await getAllChaptersData(locale);

  return {
    props: {
      chaptersData,
      languages,
      translations,
    },
  };
};

export default Search;

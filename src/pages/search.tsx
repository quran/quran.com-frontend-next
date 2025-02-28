/* eslint-disable max-lines */
import { useEffect, useMemo, useState } from 'react';

import { GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from './search.module.scss';

import { getAvailableLanguages, getNewSearchResults } from '@/api';
import DataFetcher from '@/components/DataFetcher';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import SearchBodyContainer from '@/components/Search/SearchBodyContainer';
import SearchInput from '@/components/Search/SearchInput';
import useAddQueryParamsToUrl from '@/hooks/useAddQueryParamsToUrl';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import QueryParam from '@/types/QueryParam';
import SearchResponse from '@/types/Search/SearchResponse';
import SearchService from '@/types/Search/SearchService';
import SearchQuerySource from '@/types/SearchQuerySource';
import { makeNewSearchResultsUrl } from '@/utils/apiPaths';
import { areArraysEqual } from '@/utils/array';
import { getAllChaptersData } from '@/utils/chapter';
import {
  logEvent,
  logTextSearchQuery,
  logSearchResults,
  logEmptySearchResults,
} from '@/utils/eventLogger';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl } from '@/utils/navigation';
import { getAdvancedSearchQuery } from '@/utils/search';
import AvailableLanguage from 'types/AvailableLanguage';
import ChaptersData from 'types/ChaptersData';

const PAGE_SIZE = 10;

type SearchPageProps = {
  languages: AvailableLanguage[];
  chaptersData: ChaptersData;
};

const navigationUrl = '/search';
const source = SearchQuerySource.SearchPage;

const SearchPage: NextPage<SearchPageProps> = (): JSX.Element => {
  const { t, lang } = useTranslation('common');
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual) as string[];
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get(QueryParam.QUERY) || params.get(QueryParam.QUERY_OLD) || '';
    }
    return '';
  });
  const [currentPage, setCurrentPage] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return Number(params.get(QueryParam.PAGE)) || 1;
    }
    return 1;
  });

  // Handle URL changes (both initial load and navigation)
  useEffect(() => {
    if (!router.isReady) return;

    const query = router.query[QueryParam.QUERY] || router.query[QueryParam.QUERY_OLD];
    const page = Number(router.query[QueryParam.PAGE]) || 1;

    if (query) {
      setSearchQuery(query as string);
      setCurrentPage(page);
    }
  }, [router.isReady, router.query]);

  const onPageChange = (page: number) => {
    logEvent('search_page_number_change', { page });
    setCurrentPage(page);
  };

  const queryParams = useMemo(
    () => ({
      [QueryParam.PAGE]: currentPage,
      [QueryParam.QUERY]: searchQuery || undefined,
    }),
    [currentPage, searchQuery],
  );
  useAddQueryParamsToUrl(navigationUrl, queryParams);

  const REQUEST_PARAMS = getAdvancedSearchQuery(
    searchQuery,
    currentPage,
    PAGE_SIZE,
    selectedTranslations,
  );
  const fetcher = async () => {
    logTextSearchQuery(REQUEST_PARAMS.query, source);

    try {
      const response = await getNewSearchResults(REQUEST_PARAMS);
      const finalResponse = {
        ...response,
        service: SearchService.KALIMAT,
      };

      if (response.pagination.totalRecords === 0) {
        logEmptySearchResults({
          query: searchQuery,
          source,
          service: SearchService.KALIMAT,
        });
      } else {
        logSearchResults({
          query: searchQuery,
          source,
          service: SearchService.KALIMAT,
        });
      }

      return finalResponse;
    } catch (error) {
      throw new Error('Search failed');
    }
  };

  return (
    <>
      <NextSeoWrapper
        title={
          searchQuery !== ''
            ? t('search:search-title', {
                searchQuery,
              })
            : t('search:search')
        }
        description={t('search:search-desc')}
        canonical={getCanonicalUrl(lang, navigationUrl)}
        languageAlternates={getLanguageAlternates(navigationUrl)}
      />
      <div className={styles.pageContainer}>
        <div className={styles.searchInputContainer}>
          <SearchInput initialSearchQuery={searchQuery} placeholder={t('search.title')} />
        </div>
        <div className={styles.pageBody}>
          <div className={styles.searchBodyContainer}>
            <DataFetcher
              queryKey={searchQuery ? makeNewSearchResultsUrl(REQUEST_PARAMS) : null}
              render={(searchResult) => {
                return (
                  <SearchBodyContainer
                    onSearchKeywordClicked={setSearchQuery}
                    source={source}
                    searchQuery={searchQuery}
                    searchResult={searchResult as SearchResponse}
                    currentPage={currentPage}
                    onPageChange={onPageChange}
                    pageSize={PAGE_SIZE}
                    isSearching={false}
                    hasError={false}
                  />
                );
              }}
              fetcher={fetcher}
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

export default SearchPage;

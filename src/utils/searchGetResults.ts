/* eslint-disable react-func/max-lines-per-function */

import { logEmptySearchResults, logSearchResults, logTextSearchQuery } from './eventLogger';

import { getNewSearchResults, getSearchResults } from '@/api';
import { SearchResponse } from '@/types/ApiResponses';
import { SearchMode } from '@/types/Search/SearchRequestParams';
import SearchService from '@/types/Search/SearchService';
import SearchQuerySource from '@/types/SearchQuerySource';

const searchGetResults = (
  source: SearchQuerySource,
  query: string,
  page: number,
  pageSize: number,
  setIsSearching: (arg: boolean) => void,
  setHasError: (arg: boolean) => void,
  setSearchResult: (data: SearchResponse) => void,
  language: string,
  translation?: string,
) => {
  setIsSearching(true);
  logTextSearchQuery(query, source);
  getSearchResults({
    query,
    filterLanguages: language,
    size: pageSize,
    page,
    ...(translation && { filterTranslations: translation }), // translations will be included only when there is a selected translation
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
            source,
            service: SearchService.QDC,
          });

          const kalimatResponse = await getNewSearchResults({
            mode: SearchMode.Advanced,
            query,
            size: pageSize,
            filterLanguages: language,
            page,
            exactMatchesOnly: 0,
            // translations will be included only when there is a selected translation
            ...(translation && {
              filterTranslations: translation,
              translationFields: 'resource_name',
            }),
          });

          setSearchResult({
            ...kalimatResponse,
            service: SearchService.KALIMAT,
          });

          if (kalimatResponse.pagination.totalRecords === 0) {
            logEmptySearchResults({
              query,
              source,
              service: SearchService.KALIMAT,
            });
          } else {
            logSearchResults({
              query,
              source,
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
};

export default searchGetResults;

import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import SearchResultItem from './SearchResultItem';
import SearchResultsHeader from './SearchResultsHeader';

import Pagination from '@/dls/Pagination/Pagination';
import SearchQuerySource from '@/types/SearchQuerySource';
import { toLocalizedNumber } from '@/utils/locale';
import { SearchResponse } from 'types/ApiResponses';

interface Props {
  searchResult: SearchResponse;
  searchQuery: string;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onSearchResultClicked?: () => void;
  source: SearchQuerySource;
}

const SearchResults: React.FC<Props> = ({
  searchResult,
  searchQuery,
  source,
  currentPage,
  onPageChange,
  pageSize,
  onSearchResultClicked,
}) => {
  const results = searchResult.result.navigation.concat(searchResult.result.verses);
  const isSearchDrawer = source === SearchQuerySource.SearchDrawer;
  const { t, lang } = useTranslation('common');
  return (
    <div>
      {isSearchDrawer ? (
        <SearchResultsHeader
          searchQuery={searchQuery}
          onSearchResultClicked={onSearchResultClicked}
          source={source}
        />
      ) : (
        <>
          {searchQuery && (
            <>
              {t('search-results', {
                count: toLocalizedNumber(searchResult.pagination.totalRecords, lang),
              })}
              <Pagination
                currentPage={currentPage}
                totalCount={searchResult.pagination.totalRecords}
                onPageChange={onPageChange}
                pageSize={pageSize}
              />
            </>
          )}
        </>
      )}
      <>
        {results.map((result) => (
          <SearchResultItem
            key={result.key}
            result={result}
            source={source}
            service={searchResult.service}
          />
        ))}
      </>
    </div>
  );
};

export default SearchResults;

import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import SearchResultItem from './SearchResultItem';

import Pagination from '@/dls/Pagination/Pagination';
import useScrollToTop from '@/hooks/useScrollToTop';
import SearchQuerySource from '@/types/SearchQuerySource';
import { toLocalizedNumber } from '@/utils/locale';
import { SearchResponse } from 'types/ApiResponses';

interface Props {
  searchResult: SearchResponse;
  searchQuery: string;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  source: SearchQuerySource;
}

const SearchResults: React.FC<Props> = ({
  searchResult,
  searchQuery,
  source,
  currentPage,
  onPageChange,
  pageSize,
}) => {
  const results = searchResult.result.navigation.concat(searchResult.result.verses);
  const isSearchDrawer = source === SearchQuerySource.SearchDrawer;
  const { t, lang } = useTranslation('common');
  const scrollToTop = useScrollToTop();

  const handlePageChange = (page: number) => {
    scrollToTop();
    onPageChange?.(page);
  };

  return (
    <div>
      {!isSearchDrawer && searchQuery && (
        <>
          {t('search-results', {
            count: toLocalizedNumber(searchResult.pagination.totalRecords, lang),
          })}
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
      {!isSearchDrawer && !!searchQuery && (
        <Pagination
          currentPage={currentPage}
          totalCount={searchResult.pagination.totalRecords}
          onPageChange={handlePageChange}
          pageSize={pageSize}
        />
      )}
    </div>
  );
};

export default SearchResults;

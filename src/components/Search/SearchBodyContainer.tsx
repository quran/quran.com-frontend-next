import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import NoResults from './NoResults';
import PreInput from './PreInput';
import styles from './SearchBodyContainer.module.scss';

import SearchResults from '@/components/Search/SearchResults';
import Spinner, { SpinnerSize, SpinnerSize } from '@/dls/Spinner/Spinner';
import { getSearchQueryNavigationUrl, getSearchQueryNavigationUrl } from 'src/utils/navigation';
import { VersesResponse } from 'types/ApiResponses';

interface Props {
  searchQuery: string;
  isSearching: boolean;
  isSearchDrawer?: boolean;
  hasError: boolean;
  searchResult: VersesResponse;
  onSearchKeywordClicked: (keyword: string) => void;
  onSearchResultClicked?: () => void;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  showFeedbackButtons?: boolean;
}

const SearchBodyContainer: React.FC<Props> = ({
  searchQuery,
  isSearching,
  hasError,
  searchResult,
  onSearchKeywordClicked,
  onSearchResultClicked,
  isSearchDrawer = true,
  currentPage,
  pageSize,
  onPageChange,
  showFeedbackButtons,
}) => {
  const { t } = useTranslation('common');
  const searchUrl = getSearchQueryNavigationUrl(searchQuery);
  const isEmptyResponse =
    searchResult &&
    searchResult.navigations?.length === 0 &&
    searchResult.pagination.totalRecords === 0;
  const isPreInputLayout =
    !searchQuery || isSearching || hasError || (!isSearching && !hasError && isEmptyResponse);
  return (
    <div
      className={classNames({
        [styles.internalContainer]: isPreInputLayout,
      })}
    >
      {!searchQuery ? (
        <PreInput onSearchKeywordClicked={onSearchKeywordClicked} isSearchDrawer={isSearchDrawer} />
      ) : (
        <>
          {isSearching ? (
            <Spinner size={SpinnerSize.Large} />
          ) : (
            <>
              {hasError && <div>{t('error.general')}</div>}
              {!hasError && searchResult && (
                <>
                  {isEmptyResponse ? (
                    <NoResults
                      searchQuery={searchQuery}
                      searchUrl={searchUrl}
                      isSearchDrawer={isSearchDrawer}
                    />
                  ) : (
                    <SearchResults
                      onSearchResultClicked={onSearchResultClicked}
                      searchResult={searchResult}
                      searchQuery={searchQuery}
                      isSearchDrawer={isSearchDrawer}
                      currentPage={currentPage}
                      onPageChange={onPageChange}
                      pageSize={pageSize}
                      showFeedbackButtons={showFeedbackButtons}
                    />
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default SearchBodyContainer;

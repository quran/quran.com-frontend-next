import React, { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import styles from './SearchHistory.module.scss';

import Header from '@/components/Search/PreInput/Header';
import SearchQuerySuggestion from '@/components/Search/PreInput/SearchQuerySuggestion';
import { removeSearchHistoryRecord, selectSearchHistory } from '@/redux/slices/Search/search';
import { areArraysEqual } from '@/utils/array';
import { logButtonClick } from '@/utils/eventLogger';

interface Props {
  onSearchKeywordClicked: (searchQuery: string) => void;
  isSearchDrawer: boolean;
}

const SearchHistory: React.FC<Props> = ({ onSearchKeywordClicked, isSearchDrawer }) => {
  const { t } = useTranslation('common');
  const searchHistory = useSelector(selectSearchHistory, areArraysEqual);
  const dispatch = useDispatch();

  const onRemoveSearchQueryClicked = useCallback(
    (searchQuery: string) => {
      // eslint-disable-next-line i18next/no-literal-string
      logButtonClick(`search_${isSearchDrawer ? 'drawer' : 'page'}_remove_query`);
      dispatch({ type: removeSearchHistoryRecord.type, payload: searchQuery });
    },
    [dispatch, isSearchDrawer],
  );

  // if there are no recent search queries.
  if (!searchHistory.length) {
    return <></>;
  }
  return (
    <div className={styles.container}>
      <Header text={t('search.recent')} />
      {searchHistory.map((recentSearchQuery) => (
        <SearchQuerySuggestion
          searchQuery={recentSearchQuery}
          key={`${recentSearchQuery}`}
          onSearchKeywordClicked={(searchQuery: string) => {
            logButtonClick(`search_${isSearchDrawer ? 'drawer' : 'page'}_history_item`);
            onSearchKeywordClicked(searchQuery);
          }}
          onRemoveSearchQueryClicked={onRemoveSearchQueryClicked}
        />
      ))}
    </div>
  );
};

export default SearchHistory;

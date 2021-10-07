import React, { useState, useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import CommandsList from '../CommandsList';
import PreInput from '../PreInput';

import styles from './CommandBarBody.module.scss';

import DataFetcher from 'src/components/DataFetcher';
import useDebounce from 'src/hooks/useDebounce';
import { selectSelectedTranslations } from 'src/redux/slices/QuranReader/translations';
import { makeSearchResultsUrl } from 'src/utils/apiPaths';
import { areArraysEqual } from 'src/utils/array';
import { SearchResponse } from 'types/ApiResponses';

const DEBOUNCING_PERIOD_MS = 500;

const CommandBarBody: React.FC = () => {
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual);
  const [searchQuery, setSearchQuery] = useState<string>(null);
  const { lang } = useTranslation();
  // Debounce search query to avoid having to call the API on every type. The API will be called once the user stops typing.
  const debouncedSearchQuery = useDebounce<string>(searchQuery, DEBOUNCING_PERIOD_MS);
  /**
   * Handle when the search query is changed.
   *
   * @param {React.FormEvent<HTMLInputElement>} event
   * @returns {void}
   */
  const onSearchQueryChange = useCallback((event: React.FormEvent<HTMLInputElement>): void => {
    const newSearchQuery = event.currentTarget.value;
    setSearchQuery(newSearchQuery || null);
  }, []);

  const dataFetcherRender = useCallback(
    (data: SearchResponse) =>
      data ? <CommandsList navigationItems={data.result.navigation} /> : <PreInput />,
    [],
  );

  return (
    <div className={styles.container}>
      <div className={styles.inputContainer}>
        <input
          onChange={onSearchQueryChange}
          placeholder="Search"
          className={styles.input}
          type="text"
          spellCheck="false"
          autoComplete="off"
        />
      </div>
      <div className={styles.bodyContainer}>
        <DataFetcher
          queryKey={
            debouncedSearchQuery
              ? makeSearchResultsUrl({
                  query: debouncedSearchQuery,
                  filterLanguages: lang,
                  ...(selectedTranslations &&
                    !!selectedTranslations.length && {
                      filterTranslations: selectedTranslations.join(','),
                    }),
                })
              : null
          }
          render={dataFetcherRender}
        />
      </div>
    </div>
  );
};

export default CommandBarBody;

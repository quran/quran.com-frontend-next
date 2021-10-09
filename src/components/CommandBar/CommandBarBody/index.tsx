import React, { useState, useCallback } from 'react';

import groupBy from 'lodash/groupBy';
import { useSelector } from 'react-redux';

import CommandsList, { Command } from '../CommandsList';

import styles from './CommandBarBody.module.scss';

import DataFetcher from 'src/components/DataFetcher';
import useDebounce from 'src/hooks/useDebounce';
import { selectRecentNavigations } from 'src/redux/slices/CommandBar/state';
import { makeNavigationSearchUrl } from 'src/utils/apiPaths';
import { areArraysEqual } from 'src/utils/array';
import { SearchResponse } from 'types/ApiResponses';
import { SearchNavigationResult, SearchNavigationType } from 'types/SearchNavigationResult';

const NAVIGATE_TO = [
  {
    name: 'Juz 1',
    key: 1,
    resultType: SearchNavigationType.JUZ,
  },
  {
    name: 'Page 1',
    key: 1,
    resultType: SearchNavigationType.PAGE,
  },
  {
    name: 'Surah Yasin',
    key: 36,
    resultType: SearchNavigationType.SURAH,
  },
  {
    name: '2:255',
    key: '2:255',
    resultType: SearchNavigationType.AYAH,
  },
];

const DEBOUNCING_PERIOD_MS = 100;

const CommandBarBody: React.FC = () => {
  const recentNavigations = useSelector(selectRecentNavigations, areArraysEqual);
  const [searchQuery, setSearchQuery] = useState<string>(null);
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

  /**
   * This function will be used by DataFetcher and will run only when there is no API error
   * or the connections is offline. When we receive the response from DataFetcher,
   * the data can be:
   *
   * 1. empty: which means we are in the initial state where there is no searchQuery and
   *           in this case we want to show the recent navigations from Redux (if any) + suggestions
   *           on where to navigate to.
   * 2. not empty: and this means we called the API and we got the response. The response will
   *               either have results or not (in the case when there are no matches for
   *               the search query).
   */
  const dataFetcherRender = useCallback(
    (data: SearchResponse) => {
      let toBeGroupedCommands = [] as Command[];
      let numberOfCommands = 0;
      // if it's pre-input
      if (!data) {
        toBeGroupedCommands = getPreInputCommands(recentNavigations);
        numberOfCommands = recentNavigations.length + NAVIGATE_TO.length;
      } else {
        toBeGroupedCommands = data.result.navigation.map((navigationItem) => ({
          ...navigationItem,
          group: 'Navigations',
        }));
        numberOfCommands = data.result.navigation.length;
      }
      return (
        <CommandsList
          commandGroups={{
            groups: groupBy(
              toBeGroupedCommands.map((item, index) => ({ ...item, index })), // append the index so that it can be used for keyboard navigation.
              (item) => item.group, // we group by the group name that has been attached to each command.
            ),
            numberOfCommands, // this is needed so that we can know when we have reached the last command when using keyboard navigation across multiple groups
          }}
        />
      );
    },
    [recentNavigations],
  );

  return (
    <div className={styles.container}>
      <div className={styles.inputContainer}>
        <input
          onChange={onSearchQueryChange}
          placeholder="Search"
          className={styles.input}
          type="text"
          inputMode="text"
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
        />
      </div>
      <div className={styles.bodyContainer}>
        <DataFetcher
          queryKey={debouncedSearchQuery ? makeNavigationSearchUrl(debouncedSearchQuery) : null}
          render={dataFetcherRender}
        />
      </div>
    </div>
  );
};

/**
 * Generate an array of commands that will show in the pre-input view.
 * The function takes the original recentNavigations + NAVIGATE_TO and appends
 * to each the group name + which command is clearable and which is not. The group
 * will be used by {@see groupBy} to compose the list of commands for each group.
 *
 * @param {SearchNavigationResult[]} recentNavigations the history of the command bar navigations.
 * @returns {Command[]}
 */
const getPreInputCommands = (recentNavigations: SearchNavigationResult[]): Command[] =>
  recentNavigations
    .map((recentNavigation) => ({
      ...recentNavigation,
      group: 'Recent navigations',
      isClearable: true,
    }))
    .concat(
      NAVIGATE_TO.map((navigateToItem) => ({
        ...navigateToItem,
        group: 'Try navigating to',
        isClearable: false,
      })),
    );

export default CommandBarBody;

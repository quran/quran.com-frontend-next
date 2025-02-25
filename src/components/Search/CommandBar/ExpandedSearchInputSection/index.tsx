/* eslint-disable max-lines */
import React, { useCallback, useContext } from 'react';

import classNames from 'classnames';
import groupBy from 'lodash/groupBy';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import CommandsList, { Command, RESULTS_GROUP } from '../CommandsList';

import styles from './ExpandedSearchInputSection.module.scss';

import { getNewSearchResults } from '@/api';
import DataFetcher from '@/components/DataFetcher';
import DataContext from '@/contexts/DataContext';
import { selectRecentNavigations } from '@/redux/slices/CommandBar/state';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import {
  SearchNavigationResult,
  SearchNavigationType,
} from '@/types/Search/SearchNavigationResult';
import { makeNewSearchResultsUrl } from '@/utils/apiPaths';
import { areArraysEqual } from '@/utils/array';
import { getQuickSearchQuery, getSearchNavigationResult } from '@/utils/search';
import { SearchResponse } from 'types/ApiResponses';

const NAVIGATE_TO = [
  {
    name: 'Juz 1',
    key: '1',
    resultType: SearchNavigationType.JUZ,
  },
  {
    name: 'Page 1',
    key: '1',
    resultType: SearchNavigationType.PAGE,
  },
  {
    name: 'Surah Yasin',
    key: '36',
    resultType: SearchNavigationType.SURAH,
  },
  {
    name: '2:255',
    key: '2:255',
    resultType: SearchNavigationType.AYAH,
  },
];

interface Props {
  searchQuery: string;
}

const ExpandedSearchInputSection: React.FC<Props> = ({ searchQuery }) => {
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual) as string[];
  const { t, lang } = useTranslation('common');
  const recentNavigations = useSelector(
    selectRecentNavigations,
    areArraysEqual,
  ) as SearchNavigationResult[];
  const chaptersData = useContext(DataContext);

  /**
   * Generate an array of commands that will show in the pre-input view.
   * The function takes the original recentNavigations + NAVIGATE_TO and appends
   * to each the group name + which command is clearable and which is not. The group
   * will be used by {@see groupBy} to compose the list of commands for each group.
   *
   * @param {SearchNavigationResult[]} recentNavigations the history of the command bar navigations.
   * @returns {Command[]}
   */
  const getPreInputCommands = useCallback(
    (): Command[] =>
      recentNavigations
        .map((recentNavigation) => ({
          ...recentNavigation,
          group: t('command-bar.recent-navigations'),
          isClearable: true,
        }))
        .concat(
          NAVIGATE_TO.map((navigateToItem) => ({
            ...navigateToItem,
            group: t('command-bar.try-navigating'),
            isClearable: false,
          })),
        ),
    [recentNavigations, t],
  );

  const quickSearchFetcher = useCallback(() => {
    return getNewSearchResults(getQuickSearchQuery(searchQuery, 10, selectedTranslations));
  }, [searchQuery, selectedTranslations]);

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
        toBeGroupedCommands = getPreInputCommands();
        numberOfCommands = recentNavigations.length + NAVIGATE_TO.length;
      } else if (data.result.navigation.length) {
        toBeGroupedCommands = [
          ...data.result.navigation.map((navigationItem) => ({
            ...getSearchNavigationResult(chaptersData, navigationItem, t, lang),
            group: RESULTS_GROUP,
          })),
        ];
        numberOfCommands = data.result.navigation.length;
      } else {
        // if there are no results, we will show the search page suggestion as an item
        toBeGroupedCommands = [
          {
            key: searchQuery,
            resultType: SearchNavigationType.SEARCH_PAGE,
            name: searchQuery,
            group: t('search.title'),
          },
        ];
        numberOfCommands = 1;
      }
      return (
        <CommandsList
          searchQuery={searchQuery}
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
    [chaptersData, getPreInputCommands, lang, recentNavigations.length, searchQuery, t],
  );

  return (
    <div className={styles.container}>
      <div className={classNames(styles.bodyContainer, { [styles.height]: !!searchQuery })}>
        <DataFetcher
          queryKey={
            searchQuery ? makeNewSearchResultsUrl(getQuickSearchQuery(searchQuery, 10)) : null
          }
          render={dataFetcherRender}
          fetcher={quickSearchFetcher}
        />
      </div>
    </div>
  );
};

export default ExpandedSearchInputSection;

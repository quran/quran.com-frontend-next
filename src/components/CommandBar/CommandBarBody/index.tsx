/* eslint-disable max-lines */
import React, { useState, useCallback, useEffect } from 'react';

import classNames from 'classnames';
import groupBy from 'lodash/groupBy';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import CommandsList, { Command } from '../CommandsList';

import styles from './CommandBarBody.module.scss';

import DataFetcher from '@/components/DataFetcher';
import TarteelAttribution from '@/components/TarteelAttribution/TarteelAttribution';
import VoiceSearchBodyContainer from '@/components/TarteelVoiceSearch/BodyContainer';
import TarteelVoiceSearchTrigger from '@/components/TarteelVoiceSearch/Trigger';
import useDebounce from '@/hooks/useDebounce';
import IconSearch from '@/icons/search.svg';
import { selectRecentNavigations } from '@/redux/slices/CommandBar/state';
import { selectIsCommandBarVoiceFlowStarted } from '@/redux/slices/voiceSearch';
import SearchQuerySource from '@/types/SearchQuerySource';
import { makeSearchResultsUrl } from '@/utils/apiPaths';
import { areArraysEqual } from '@/utils/array';
import { logButtonClick, logTextSearchQuery } from '@/utils/eventLogger';
import { SearchResponse } from 'types/ApiResponses';
import { SearchNavigationType } from 'types/SearchNavigationResult';

const NAVIGATE_TO = [
  {
    name: 'Juz 1',
    key: 1,
    resultType: SearchNavigationType.JUZ,
  },
  {
    name: 'Hizb 1',
    key: 1,
    resultType: SearchNavigationType.HIZB,
  },
  {
    name: 'Rub el Hizb 1',
    key: 1,
    resultType: SearchNavigationType.RUB_EL_HIZB,
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

const DEBOUNCING_PERIOD_MS = 1500;

const CommandBarBody: React.FC = () => {
  const { t } = useTranslation('common');
  const recentNavigations = useSelector(selectRecentNavigations, areArraysEqual);
  const isVoiceSearchFlowStarted = useSelector(selectIsCommandBarVoiceFlowStarted, shallowEqual);
  const [searchQuery, setSearchQuery] = useState<string>(null);
  // Debounce search query to avoid having to call the API on every type. The API will be called once the user stops typing.
  const debouncedSearchQuery = useDebounce<string>(searchQuery, DEBOUNCING_PERIOD_MS);

  useEffect(() => {
    // only when the search query has a value we call the API.
    if (debouncedSearchQuery) {
      logTextSearchQuery(debouncedSearchQuery, SearchQuerySource.CommandBar);
    }
  }, [debouncedSearchQuery]);

  /**
   * Handle when the search query is changed.
   *
   * @param {React.FormEvent<HTMLInputElement>} event
   * @returns {void}
   */
  const onSearchQueryChange = useCallback((event: React.FormEvent<HTMLInputElement>): void => {
    setSearchQuery(event.currentTarget.value || null);
  }, []);

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
      } else {
        toBeGroupedCommands = [
          ...data.result.navigation.map((navigationItem) => ({
            ...navigationItem,
            group: t('command-bar.navigations'),
          })),
          {
            key: searchQuery,
            resultType: SearchNavigationType.SEARCH_PAGE,
            name: searchQuery,
            group: t('search.title'),
          },
        ];
        numberOfCommands = data.result.navigation.length + 1;
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
    [getPreInputCommands, recentNavigations.length, searchQuery, t],
  );

  return (
    <div className={styles.container}>
      <div
        className={classNames(styles.inputContainer, {
          [styles.voiceFlowContainer]: isVoiceSearchFlowStarted,
        })}
      >
        {!isVoiceSearchFlowStarted && (
          <div className={styles.textInputContainer}>
            <IconSearch />
            <input
              onChange={onSearchQueryChange}
              placeholder={t('command-bar.placeholder')}
              className={styles.input}
              type="text"
              inputMode="text"
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
            />
          </div>
        )}
        <TarteelVoiceSearchTrigger
          isCommandBar
          onClick={(startFlow: boolean) => {
            logButtonClick(
              // eslint-disable-next-line i18next/no-literal-string
              `command_bar_voice_search_${startFlow ? 'start' : 'stop'}_flow`,
            );
          }}
        />
      </div>
      <div className={styles.bodyContainer}>
        {isVoiceSearchFlowStarted ? (
          <VoiceSearchBodyContainer isCommandBar />
        ) : (
          <DataFetcher
            queryKey={searchQuery ? makeSearchResultsUrl({ query: searchQuery }) : null}
            render={dataFetcherRender}
          />
        )}
      </div>
      <div className={styles.attribution}>
        <TarteelAttribution isCommandBar />
      </div>
    </div>
  );
};

export default CommandBarBody;

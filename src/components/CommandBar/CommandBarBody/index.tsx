/* eslint-disable max-lines */
import React, { useState, useCallback } from 'react';

import classNames from 'classnames';
import groupBy from 'lodash/groupBy';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import IconSearch from '../../../../public/icons/search.svg';
import CommandsList, { Command } from '../CommandsList';

import styles from './CommandBarBody.module.scss';

import TarteelAttribution from 'src/components/TarteelAttribution/TarteelAttribution';
import VoiceSearchBodyContainer from 'src/components/TarteelVoiceSearch/BodyContainer';
import TarteelVoiceSearchTrigger from 'src/components/TarteelVoiceSearch/Trigger';
import { selectRecentNavigations } from 'src/redux/slices/CommandBar/state';
import { selectIsCommandBarVoiceFlowStarted } from 'src/redux/slices/voiceSearch';
import { areArraysEqual } from 'src/utils/array';
import { logButtonClick } from 'src/utils/eventLogger';
import { SearchNavigationType } from 'types/SearchNavigationResult';

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

const CommandBarBody: React.FC = () => {
  const { t } = useTranslation('common');
  const recentNavigations = useSelector(selectRecentNavigations, areArraysEqual);
  const isVoiceSearchFlowStarted = useSelector(selectIsCommandBarVoiceFlowStarted, shallowEqual);
  const [searchQuery, setSearchQuery] = useState<string>(null);
  /**
   * Handle when the search query is changed.
   *
   * @param {React.FormEvent<HTMLInputElement>} event
   * @returns {void}
   */
  const onSearchQueryChange = useCallback((event: React.FormEvent<HTMLInputElement>): void => {
    setSearchQuery(event.currentTarget.value || null);
  }, []);

  const renderCommands = useCallback(() => {
    let toBeGroupedCommands = [] as Command[];
    let numberOfCommands = 0;
    // if it's pre-input
    if (!searchQuery) {
      toBeGroupedCommands = recentNavigations
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
        );
      numberOfCommands = recentNavigations.length + NAVIGATE_TO.length;
    } else {
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
        commandGroups={{
          groups: groupBy(
            toBeGroupedCommands.map((item, index) => ({ ...item, index })), // append the index so that it can be used for keyboard navigation.
            (item) => item.group, // we group by the group name that has been attached to each command.
          ),
          numberOfCommands, // this is needed so that we can know when we have reached the last command when using keyboard navigation across multiple groups
        }}
      />
    );
  }, [recentNavigations, searchQuery, t]);

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
        {isVoiceSearchFlowStarted ? <VoiceSearchBodyContainer isCommandBar /> : renderCommands()}
      </div>
      <div className={styles.attribution}>
        <TarteelAttribution isCommandBar />
      </div>
    </div>
  );
};

export default CommandBarBody;

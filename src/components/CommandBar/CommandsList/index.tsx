/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable max-lines */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import React, { MouseEvent, useState, useCallback, RefObject, useEffect } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useHotkeys } from 'react-hotkeys-hook';
import { useDispatch } from 'react-redux';

import CommandControl from './CommandControl';
import styles from './CommandList.module.scss';
import CommandPrefix from './CommandPrefix';

import useScroll, { SMOOTH_SCROLL_TO_CENTER } from '@/hooks/useScrollToElement';
import {
  addRecentNavigation,
  removeRecentNavigation,
  setIsOpen,
} from '@/redux/slices/CommandBar/state';
import { logButtonClick } from '@/utils/eventLogger';
import { resolveUrlBySearchNavigationType } from '@/utils/navigation';
import { SearchNavigationResult } from 'types/SearchNavigationResult';

export interface Command extends SearchNavigationResult {
  group: string;
  index?: number;
  isClearable?: boolean;
}

interface Props {
  commandGroups: { groups: Record<string, Command[]>; numberOfCommands: number };
}

const CommandsList: React.FC<Props> = ({ commandGroups: { groups, numberOfCommands } }) => {
  const { t } = useTranslation('common');
  const [scrollToSelectedCommand, selectedItemRef]: [() => void, RefObject<HTMLLIElement>] =
    useScroll(SMOOTH_SCROLL_TO_CENTER);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(numberOfCommands ? 0 : null);

  const [highlightOffset, setHighlightOffset] = useState<number>(null);
  useEffect(() => {
    if (selectedItemRef.current) {
      setHighlightOffset(selectedItemRef.current.offsetTop);
    }
  }, [selectedCommandIndex, selectedItemRef]);

  // when the value of numberOfCommands changes, it would be due to change of the query string so we need to reset the selected command
  useEffect(() => {
    setSelectedCommandIndex(numberOfCommands ? 0 : null);
  }, [numberOfCommands]);

  const router = useRouter();
  const dispatch = useDispatch();
  const onUpKeyClicked = useCallback(
    (event: KeyboardEvent) => {
      // prevent the input's cursor to jump to the end of the input value.
      event.preventDefault();
      setSelectedCommandIndex((prevSelectedCommandIndex) => prevSelectedCommandIndex - 1);
      scrollToSelectedCommand();
    },
    [scrollToSelectedCommand],
  );
  const onDownKeyClicked = useCallback(
    (event: KeyboardEvent) => {
      // prevent the input's cursor to jump to the beginning of the input value.
      event.preventDefault();
      setSelectedCommandIndex((prevSelectedCommandIndex) => prevSelectedCommandIndex + 1);
      scrollToSelectedCommand();
    },
    [scrollToSelectedCommand],
  );
  const navigateToLink = useCallback(
    (command: Command) => {
      const { name, resultType, key } = command;
      router.push(resolveUrlBySearchNavigationType(resultType, key)).then(() => {
        dispatch({ type: addRecentNavigation.type, payload: { name, resultType, key } });
        dispatch({ type: setIsOpen.type, payload: false });
      });
    },
    [dispatch, router],
  );
  useHotkeys(
    'up',
    onUpKeyClicked,
    {
      enabled: numberOfCommands && selectedCommandIndex !== 0,
      enableOnTags: ['INPUT'],
    },
    [scrollToSelectedCommand],
  );
  useHotkeys(
    'down',
    onDownKeyClicked,
    {
      enabled: numberOfCommands && selectedCommandIndex !== numberOfCommands - 1,
      enableOnTags: ['INPUT'],
    },
    [scrollToSelectedCommand],
  );
  useHotkeys(
    'enter',
    () => {
      let navigateTo = null;
      Object.keys(groups).forEach((commandGroup) => {
        const selectedCommand = groups[commandGroup].find(
          (command) => command.index === selectedCommandIndex,
        );
        if (selectedCommand) {
          navigateTo = selectedCommand;
        }
      });
      navigateToLink(navigateTo);
    },
    { enabled: selectedCommandIndex !== null, enableOnTags: ['INPUT'] },
    [selectedCommandIndex, groups, navigateToLink],
  );
  const onRemoveCommandClicked = (
    event: MouseEvent<Element>,
    navigationItemKey: number | string,
  ) => {
    logButtonClick('remove_command_bar_navigation');
    // to not allow the event to bubble up to the parent container
    event.stopPropagation();
    dispatch({ type: removeRecentNavigation.type, payload: navigationItemKey });
  };

  if (numberOfCommands === 0) {
    return <p className={styles.noResult}>{t('command-bar.no-nav-results')}</p>;
  }
  return (
    <ul role="listbox">
      <div
        className={styles.highlight}
        style={{
          transform: highlightOffset ? `translateY(${highlightOffset}px)` : `translateY(100%)`,
        }}
      />
      <li role="presentation">
        {Object.keys(groups).map((commandGroup) => {
          return (
            <div key={commandGroup}>
              <div className={styles.groupHeader} id={commandGroup}>
                {commandGroup}
              </div>
              <ul role="group" aria-labelledby={commandGroup}>
                {groups[commandGroup].map((command) => {
                  const { name, resultType } = command;
                  const isSelected = selectedCommandIndex === command.index;
                  return (
                    <li
                      ref={isSelected ? selectedItemRef : null}
                      role="option"
                      aria-selected={isSelected}
                      key={command.index}
                      className={classNames(styles.command, { [styles.selected]: isSelected })}
                      onClick={() => navigateToLink(command)}
                      onMouseOver={() => setSelectedCommandIndex(command.index)}
                    >
                      <CommandPrefix name={name} type={resultType} />
                      <div className={styles.keyboardInputContainer}>
                        <CommandControl
                          isClearable={command.isClearable}
                          isSelected={isSelected}
                          commandKey={command.key}
                          onRemoveCommandClicked={onRemoveCommandClicked}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </li>
    </ul>
  );
};

export default CommandsList;

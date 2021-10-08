/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import React, { MouseEvent, useState, useCallback, RefObject, useEffect } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useHotkeys } from 'react-hotkeys-hook';
import { useDispatch } from 'react-redux';

import styles from './CommandList.module.scss';
import ItemControl from './ItemControl';
import ItemPrefix from './ItemPrefix';

import useScroll, { SMOOTH_SCROLL_TO_CENTER } from 'src/hooks/useScrollToElement';
import {
  addRecentNavigation,
  removeRecentNavigation,
  setIsOpen,
} from 'src/redux/slices/CommandBar/state';
import { resolveUrlBySearchNavigationType } from 'src/utils/navigation';
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
  const [scrollToSelectedCommand, selectedItemRef]: [() => void, RefObject<HTMLLIElement>] =
    useScroll(SMOOTH_SCROLL_TO_CENTER);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(numberOfCommands ? 0 : null);

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
  const navigateToItem = useCallback(
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
      navigateToItem(navigateTo);
    },
    { enabled: selectedCommandIndex !== null, enableOnTags: ['INPUT'] },
    [selectedCommandIndex, groups, navigateToItem],
  );
  const onRemoveItemClicked = (event: MouseEvent<Element>, navigationItemKey: number | string) => {
    // to not allow the event to bubble up to the parent container
    event.stopPropagation();
    dispatch({ type: removeRecentNavigation.type, payload: navigationItemKey });
  };

  const onItemSelected = (itemIndex: number) => {
    setSelectedCommandIndex(itemIndex);
  };

  if (numberOfCommands === 0) {
    return <p className={styles.noResult}>No navigation results</p>;
  }
  return (
    <ul role="listbox">
      <li role="presentation">
        {Object.keys(groups).map((commandGroup) => {
          return (
            <div key={commandGroup}>
              <div className={styles.groupHeader} id={commandGroup}>
                {commandGroup}
              </div>
              <ul role="group" aria-labelledby={commandGroup}>
                {groups[commandGroup].map((command) => {
                  const isSelected = selectedCommandIndex === command.index;
                  return (
                    <li
                      ref={isSelected ? selectedItemRef : null}
                      role="option"
                      aria-selected={isSelected}
                      key={command.index}
                      className={classNames(styles.commandItem, {
                        [styles.selected]: isSelected,
                      })}
                      onClick={() => navigateToItem(command)}
                      onMouseOver={() => onItemSelected(command.index)}
                    >
                      <ItemPrefix name={command.name} />
                      <div className={styles.keyboardInputContainer}>
                        <ItemControl
                          isClearable={command.isClearable}
                          isSelected={isSelected}
                          commandKey={command.key}
                          onRemoveItemClicked={onRemoveItemClicked}
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

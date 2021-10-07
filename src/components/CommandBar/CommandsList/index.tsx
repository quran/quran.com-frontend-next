/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import React, { MouseEvent, useState, useCallback, RefObject } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useHotkeys } from 'react-hotkeys-hook';
import { useDispatch } from 'react-redux';

import NavigateIcon from '../../../../public/icons/east.svg';

import styles from './CommandList.module.scss';

import Button, { ButtonSize, ButtonVariant } from 'src/components/dls/Button/Button';
import KeyboardInput from 'src/components/dls/KeyboardInput';
import useScroll, { SMOOTH_SCROLL_TO_CENTER } from 'src/hooks/useScrollToElement';
import {
  addRecentNavigation,
  removeRecentNavigation,
  setIsOpen,
} from 'src/redux/slices/commandBar';
import { resolveUrlBySearchNavigationType } from 'src/utils/navigation';
import { SearchNavigationResult } from 'types/SearchNavigationResult';

interface Props {
  isPreInput?: boolean;
  navigationItems: SearchNavigationResult[];
}

const CommandsList: React.FC<Props> = ({ navigationItems, isPreInput = false }) => {
  const numberOfItems = navigationItems.length;
  const [scrollToSelectedItem, selectedItemRef]: [() => void, RefObject<HTMLLIElement>] =
    useScroll(SMOOTH_SCROLL_TO_CENTER);
  const [selectedItemIndex, setSelectedItemIndex] = useState(() => (!numberOfItems ? null : 0));
  const router = useRouter();
  const dispatch = useDispatch();
  const onUpKeyClicked = useCallback(
    (event: KeyboardEvent) => {
      // prevent the input's cursor to jump to the end of the input value.
      event.preventDefault();
      setSelectedItemIndex((prevSelectedItemIndex) => prevSelectedItemIndex - 1);
      scrollToSelectedItem();
    },
    [scrollToSelectedItem],
  );
  const onDownKeyClicked = useCallback(
    (event: KeyboardEvent) => {
      // prevent the input's cursor to jump to the beginning of the input value.
      event.preventDefault();
      setSelectedItemIndex((prevSelectedItemIndex) => prevSelectedItemIndex + 1);
      scrollToSelectedItem();
    },
    [scrollToSelectedItem],
  );
  const navigateToItem = useCallback(
    (navigationItem: SearchNavigationResult) => {
      router
        .push(resolveUrlBySearchNavigationType(navigationItem.resultType, navigationItem.key))
        .then(() => {
          dispatch({ type: addRecentNavigation.type, payload: navigationItem });
          dispatch({ type: setIsOpen.type, payload: false });
        });
    },
    [dispatch, router],
  );
  useHotkeys(
    'up',
    onUpKeyClicked,
    {
      enabled: numberOfItems && selectedItemIndex !== 0,
      enableOnTags: ['INPUT'],
    },
    [scrollToSelectedItem],
  );
  useHotkeys(
    'down',
    onDownKeyClicked,
    {
      enabled: numberOfItems && selectedItemIndex !== numberOfItems - 1,
      enableOnTags: ['INPUT'],
    },
    [scrollToSelectedItem],
  );
  useHotkeys(
    'enter',
    () => {
      navigateToItem(navigationItems[selectedItemIndex]);
    },
    { enabled: selectedItemIndex !== null, enableOnTags: ['INPUT'] },
    [navigateToItem, navigationItems, selectedItemIndex],
  );
  const onRemoveItemClicked = (event: MouseEvent<Element>, navigationItemKey: number | string) => {
    // to not allow the event to bubble up to the parent container
    event.stopPropagation();
    dispatch({ type: removeRecentNavigation.type, payload: navigationItemKey });
  };

  if (!numberOfItems) {
    return (
      <p className={styles.noResult}>
        {isPreInput ? 'No recent navigations' : 'No navigation results'}{' '}
      </p>
    );
  }

  const onItemHover = (itemIndex: number) => {
    setSelectedItemIndex(itemIndex);
  };

  return (
    <ul role="listbox">
      <li role="presentation">
        <div className={styles.groupHeader} id="navigation">
          {isPreInput ? 'Recent navigations' : 'Navigations'}
        </div>
        <ul role="group" aria-labelledby="navigation">
          {navigationItems.map((navigationItem, index) => (
            <li
              ref={selectedItemIndex === index ? selectedItemRef : null}
              role="option"
              aria-selected={selectedItemIndex === index}
              key={navigationItem.key}
              className={classNames(styles.commandItem, {
                [styles.selected]: selectedItemIndex === index,
              })}
              onClick={() => navigateToItem(navigationItem)}
              onMouseOver={() => onItemHover(index)}
            >
              <div className={styles.commandItemBody}>
                <span className={styles.commandPrefix}>
                  <NavigateIcon />
                </span>
                {navigationItem.name}
              </div>
              <div className={styles.keyboardInputContainer}>
                {isPreInput ? (
                  <Button
                    variant={ButtonVariant.Ghost}
                    size={ButtonSize.Small}
                    onClick={(e) => onRemoveItemClicked(e, navigationItem.key)}
                  >
                    X
                  </Button>
                ) : (
                  <KeyboardInput keyboardKey="enter" />
                )}
              </div>
            </li>
          ))}
        </ul>
      </li>
    </ul>
  );
};

export default CommandsList;

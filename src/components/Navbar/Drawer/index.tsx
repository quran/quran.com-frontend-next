import React, { useRef, useEffect, useCallback, ReactNode } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useHotkeys } from 'react-hotkeys-hook';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import SearchDrawerFooter from '../SearchDrawer/Footer';

import styles from './Drawer.module.scss';
import DrawerCloseButton from './DrawerCloseButton';

import useOutsideClickDetector from 'src/hooks/useOutsideClickDetector';
import usePreventBodyScrolling from 'src/hooks/usePreventBodyScrolling';
import {
  Navbar,
  selectNavbar,
  setIsNavigationDrawerOpen,
  setIsSearchDrawerOpen,
  setIsSettingsDrawerOpen,
} from 'src/redux/slices/navbar';
import { stopSearchDrawerVoiceFlow } from 'src/redux/slices/voiceSearch';
import { logEvent } from 'src/utils/eventLogger';

export enum DrawerType {
  Navigation = 'navigation',
  Search = 'search',
  Settings = 'settings',
}

export enum DrawerSide {
  Left = 'left',
  Right = 'right',
}

interface Props {
  type: DrawerType;
  side?: DrawerSide;
  header: ReactNode;
  hideCloseButton?: boolean;
  children: ReactNode;
  closeOnNavigation?: boolean;
}

/**
 * Check whether a specific drawer is open or not based on the type.
 *
 * @param {DrawerType} type
 * @param {Navbar} navbar
 * @returns {boolean}
 */
const getIsOpen = (type: DrawerType, navbar: Navbar): boolean => {
  const { isNavigationDrawerOpen, isSettingsDrawerOpen, isSearchDrawerOpen } = navbar;
  if (type === DrawerType.Navigation) {
    return isNavigationDrawerOpen;
  }
  if (type === DrawerType.Settings) {
    return isSettingsDrawerOpen;
  }
  return isSearchDrawerOpen;
};

const getActionCreator = (type: DrawerType) => {
  if (type === DrawerType.Navigation) {
    return setIsNavigationDrawerOpen.type;
  }
  if (type === DrawerType.Settings) {
    return setIsSettingsDrawerOpen.type;
  }
  return setIsSearchDrawerOpen.type;
};

const logDrawerCloseEvent = (type: string, actionSource: string) => {
  // eslint-disable-next-line i18next/no-literal-string
  logEvent(`drawer_${type}_close_${actionSource}`);
};

const Drawer: React.FC<Props> = ({
  type,
  side = DrawerSide.Right,
  header,
  children,
  hideCloseButton = false,
  closeOnNavigation = true,
}) => {
  const { isVisible: isNavbarVisible } = useSelector(selectNavbar, shallowEqual);
  const drawerRef = useRef(null);
  const dispatch = useDispatch();
  const navbar = useSelector(selectNavbar, shallowEqual);
  const isOpen = getIsOpen(type, navbar);
  usePreventBodyScrolling(isOpen);
  const router = useRouter();

  const closeDrawer = useCallback(
    (actionSource = 'click') => {
      dispatch({ type: getActionCreator(type), payload: false });
      if (type === DrawerType.Search) {
        dispatch({ type: stopSearchDrawerVoiceFlow.type });
      }
      logDrawerCloseEvent(type, actionSource);
    },
    [dispatch, type],
  );
  // enableOnTags is added for when Search Drawer's input field is focused or when Settings Drawer's select input is focused
  useHotkeys(
    'Escape',
    () => {
      closeDrawer('esc_key');
    },
    { enabled: isOpen, enableOnTags: ['INPUT', 'SELECT'] },
  );

  // Hide navbar after successful navigation
  useEffect(() => {
    router.events.on('routeChangeComplete', () => {
      if (isOpen && closeOnNavigation) {
        closeDrawer('navigation');
      }
    });
  }, [closeDrawer, router.events, isOpen, closeOnNavigation]);

  useOutsideClickDetector(
    drawerRef,
    () => {
      closeDrawer('outside_click');
    },
    isOpen,
  );
  const isSearchDrawer = type === DrawerType.Search;
  return (
    <div
      className={classNames(styles.container, {
        [styles.navbarInvisible]: !isNavbarVisible,
        [styles.containerOpen]: isOpen,
        [styles.left]: side === DrawerSide.Left,
        [styles.right]: side === DrawerSide.Right,
      })}
      ref={drawerRef}
    >
      <div
        className={classNames(styles.header, {
          [styles.hiddenButtonHeader]: hideCloseButton,
        })}
      >
        <div
          className={classNames(styles.headerContentContainer, {
            [styles.hiddenButtonHeaderContentContainer]: hideCloseButton,
          })}
        >
          <div className={styles.headerContent}>
            {header}
            {!hideCloseButton && <DrawerCloseButton onClick={() => closeDrawer()} />}
          </div>
        </div>
      </div>
      <div
        className={classNames(styles.bodyContainer, {
          [styles.navigationBodyContainer]: type === DrawerType.Navigation,
          [styles.bodyWithBottomPadding]: !isSearchDrawer,
          [styles.searchContainer]: isSearchDrawer,
        })}
      >
        {children}
        {isSearchDrawer && <SearchDrawerFooter />}
      </div>
    </div>
  );
};

export default Drawer;

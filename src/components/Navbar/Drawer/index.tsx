/* eslint-disable max-lines */
import React, { useRef, useEffect, useCallback, ReactNode } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useHotkeys } from 'react-hotkeys-hook';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import SearchDrawerFooter from '../SearchDrawer/Footer';

import styles from './Drawer.module.scss';
import DrawerCloseButton from './DrawerCloseButton';

import useOutsideClickDetector from '@/hooks/useOutsideClickDetector';
import usePreventBodyScrolling from '@/hooks/usePreventBodyScrolling';
import {
  Navbar,
  selectNavbar,
  setIsNavigationDrawerOpen,
  setIsSearchDrawerOpen,
  setIsSettingsDrawerOpen,
  setIsVisible,
} from '@/redux/slices/navbar';
import { stopSearchDrawerVoiceFlow } from '@/redux/slices/voiceSearch';
import { logEvent } from '@/utils/eventLogger';

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
  canCloseDrawer?: boolean;
  bodyId?: string;
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

enum ActionSource {
  Click = 'click',
  EscKey = 'esc_key',
  OutsideClick = 'outside_click',
  Navigation = 'navigation',
}

const Drawer: React.FC<Props> = ({
  type,
  side = DrawerSide.Right,
  header,
  children,
  hideCloseButton = false,
  closeOnNavigation = true,
  canCloseDrawer = true,
  bodyId,
}) => {
  const { isVisible: isNavbarVisible } = useSelector(selectNavbar, shallowEqual);
  const drawerRef = useRef(null);
  const dispatch = useDispatch();
  const navbar = useSelector(selectNavbar, shallowEqual);
  const isOpen = getIsOpen(type, navbar);
  // when the drawer is open and the onboarding is not active.
  usePreventBodyScrolling(isOpen);
  const router = useRouter();

  const closeDrawer = useCallback(
    (actionSource: ActionSource = ActionSource.Click) => {
      if (!canCloseDrawer) {
        return;
      }

      dispatch({ type: getActionCreator(type), payload: false });
      if (type === DrawerType.Search) {
        dispatch({ type: stopSearchDrawerVoiceFlow.type });
      }
      logDrawerCloseEvent(type, actionSource);
    },
    [dispatch, type, canCloseDrawer],
  );
  // enableOnTags is added for when Search Drawer's input field is focused or when Settings Drawer's select input is focused
  useHotkeys(
    'Escape',
    () => {
      closeDrawer(ActionSource.EscKey);
    },
    { enabled: isOpen, enableOnTags: ['INPUT', 'SELECT'] },
  );

  useEffect(() => {
    // Keep nav bar visible when drawer is open
    if (isOpen) {
      dispatch(setIsVisible(true));
    }

    // Hide navbar after successful navigation
    router.events.on('routeChangeComplete', () => {
      if (isOpen && closeOnNavigation) {
        closeDrawer(ActionSource.Navigation);
      }
    });
  }, [closeDrawer, dispatch, router.events, isNavbarVisible, isOpen, closeOnNavigation]);

  useOutsideClickDetector(
    drawerRef,
    () => {
      closeDrawer(ActionSource.OutsideClick);
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
      id={type === DrawerType.Settings ? 'settings-drawer-container' : undefined}
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
        id={bodyId}
      >
        {children}
        {isSearchDrawer && <SearchDrawerFooter />}
      </div>
    </div>
  );
};

export default Drawer;

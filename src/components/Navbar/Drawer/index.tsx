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
  setIsLanguageDrawerOpen,
  setIsNavigationDrawerOpen,
  setIsSearchDrawerOpen,
  setIsSettingsDrawerOpen,
  setLockVisibilityState,
} from '@/redux/slices/navbar';
import { logEvent } from '@/utils/eventLogger';

export enum DrawerType {
  Navigation = 'navigation',
  Search = 'search',
  Settings = 'settings',
  Language = 'language',
}

export enum DrawerSide {
  Left = 'left',
  Right = 'right',
}

interface Props {
  id?: string;
  type: DrawerType;
  side?: DrawerSide;
  header: ReactNode;
  hideCloseButton?: boolean;
  children: ReactNode;
  closeOnNavigation?: boolean;
  canCloseDrawer?: boolean;
  bodyId?: string;
  removeHeaderWrapper?: boolean;
  removeBodySpacing?: boolean;
  className?: string;
  closeOnOutsideClick?: boolean;
}

/**
 * Check whether a specific drawer is open or not based on the type.
 *
 * @param {DrawerType} type
 * @param {Navbar} navbar
 * @returns {boolean}
 */
const getIsOpen = (type: DrawerType, navbar: Navbar): boolean => {
  const { isNavigationDrawerOpen, isSettingsDrawerOpen, isSearchDrawerOpen, isLanguageDrawerOpen } =
    navbar;
  if (type === DrawerType.Navigation) {
    return isNavigationDrawerOpen;
  }
  if (type === DrawerType.Language) {
    return isLanguageDrawerOpen;
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
  if (type === DrawerType.Language) {
    return setIsLanguageDrawerOpen.type;
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
  id,
  type,
  side = DrawerSide.Right,
  header,
  children,
  hideCloseButton = false,
  closeOnNavigation = true,
  canCloseDrawer = true,
  bodyId,
  removeHeaderWrapper = false,
  removeBodySpacing = false,
  className,
  closeOnOutsideClick = true,
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
      logDrawerCloseEvent(type, actionSource);
    },
    [dispatch, type, canCloseDrawer],
  );
  // enableOnFormTags is added for when Search Drawer's input field is focused or when Settings Drawer's select input is focused
  useHotkeys(
    'Escape',
    () => {
      closeDrawer(ActionSource.EscKey);
    },
    { enabled: isOpen, enableOnFormTags: ['INPUT', 'SELECT'] },
  );

  useEffect(() => {
    // Lock navbar visibility state when drawer is open to prevent scroll-based changes
    // Unlock when drawer is closed to restore normal scroll behavior
    if (isOpen) {
      dispatch(setLockVisibilityState(true));
    } else {
      dispatch(setLockVisibilityState(false));
    }
  }, [dispatch, isOpen]);

  useEffect(() => {
    // Hide navbar after successful navigation
    const handleRouteChange = () => {
      if (isOpen && closeOnNavigation) {
        closeDrawer(ActionSource.Navigation);
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    // Cleanup function to remove the event listener
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [closeDrawer, router.events, isOpen, closeOnNavigation]);

  useOutsideClickDetector(
    drawerRef,
    () => {
      if (closeOnOutsideClick) {
        closeDrawer(ActionSource.OutsideClick);
      }
    },
    isOpen,
  );

  const isSearchDrawer = type === DrawerType.Search;
  const isSettingsDrawer = type === DrawerType.Settings;

  return (
    <div
      data-testid={isOpen ? id || `${type}-drawer-container` : undefined}
      className={classNames(styles.container, className, {
        [styles.navbarInvisible]: !isNavbarVisible,
        [styles.containerOpen]: isOpen,
        [styles.left]: side === DrawerSide.Left,
        [styles.right]: side === DrawerSide.Right,
        [styles.noTransition]: type === DrawerType.Search && navbar.disableSearchDrawerTransition,
        [styles.settingsDrawer]: isSettingsDrawer,
      })}
      ref={drawerRef}
      id={isSettingsDrawer ? 'settings-drawer-container' : undefined}
    >
      {removeHeaderWrapper ? (
        <>
          {header}
          {!hideCloseButton && <DrawerCloseButton onClick={() => closeDrawer()} />}
        </>
      ) : (
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
      )}
      <div
        className={classNames(styles.bodyContainer, {
          [styles.navigationBodyContainer]: type === DrawerType.Navigation,
          [styles.bodyWithBottomPadding]: !isSearchDrawer,
          [styles.searchContainer]: isSearchDrawer,
          [styles.noBodySpacing]: removeBodySpacing,
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

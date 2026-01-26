/* eslint-disable max-lines */
import React, { useRef, useEffect, useCallback, ReactNode } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useHotkeys } from 'react-hotkeys-hook';

import SearchDrawerFooter from '../SearchDrawer/Footer';

import styles from './Drawer.module.scss';
import DrawerCloseButton from './DrawerCloseButton';

import useNavbarDrawerActions, { ActionSource } from '@/hooks/useNavbarDrawerActions';
import useNavbarState from '@/hooks/useNavbarState';
import useOutsideClickDetector from '@/hooks/useOutsideClickDetector';
import usePreventBodyScrolling from '@/hooks/usePreventBodyScrolling';

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
}

/**
 * Helper to get the open state for a specific drawer type.
 *
 * @returns {boolean} Whether the drawer is open
 */
const getIsOpen = (
  type: DrawerType,
  navbarState: {
    isNavigationDrawerOpen: boolean;
    isSettingsDrawerOpen: boolean;
    isSearchDrawerOpen: boolean;
  },
): boolean => {
  if (type === DrawerType.Navigation) {
    return navbarState.isNavigationDrawerOpen;
  }
  if (type === DrawerType.Settings) {
    return navbarState.isSettingsDrawerOpen;
  }
  return navbarState.isSearchDrawerOpen;
};

/**
 * Helper to get the close action for a specific drawer type.
 *
 * @returns {Function} The close action function for the drawer type
 */
const getCloseAction = (
  type: DrawerType,
  actions: {
    closeNavigationDrawer: (source: ActionSource) => void;
    closeSettingsDrawer: (source: ActionSource) => void;
    closeSearchDrawer: (source: ActionSource) => void;
  },
): ((source: ActionSource) => void) => {
  if (type === DrawerType.Navigation) {
    return actions.closeNavigationDrawer;
  }
  if (type === DrawerType.Settings) {
    return actions.closeSettingsDrawer;
  }
  return actions.closeSearchDrawer;
};

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
}) => {
  const navbarState = useNavbarState();
  const drawerActions = useNavbarDrawerActions();
  const drawerRef = useRef(null);
  const router = useRouter();

  const isOpen = getIsOpen(type, navbarState);
  const closeDrawerAction = getCloseAction(type, drawerActions);

  // Prevent body scrolling when drawer is open
  usePreventBodyScrolling(isOpen);

  const closeDrawer = useCallback(
    (actionSource: ActionSource = ActionSource.Click) => {
      if (!canCloseDrawer) {
        return;
      }
      closeDrawerAction(actionSource);
    },
    [canCloseDrawer, closeDrawerAction],
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
    drawerActions.lockNavbarVisibility(isOpen);
  }, [drawerActions, isOpen]);

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
      closeDrawer(ActionSource.OutsideClick);
    },
    isOpen,
  );

  const isSearchDrawer = type === DrawerType.Search;
  const isSettingsDrawer = type === DrawerType.Settings;

  return (
    <div
      data-testid={isOpen ? id || `${type}-drawer-container` : undefined}
      className={classNames(styles.container, className, {
        [styles.navbarInvisible]: !navbarState.isVisible,
        [styles.containerOpen]: isOpen,
        [styles.left]: side === DrawerSide.Left,
        [styles.right]: side === DrawerSide.Right,
        [styles.noTransition]: isSearchDrawer && navbarState.disableSearchDrawerTransition,
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

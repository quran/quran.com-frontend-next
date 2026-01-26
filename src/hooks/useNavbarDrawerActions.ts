import { useCallback } from 'react';

import { useDispatch } from 'react-redux';

import {
  setDisableSearchDrawerTransition,
  setIsNavigationDrawerOpen,
  setIsSearchDrawerOpen,
  setIsSettingsDrawerOpen,
  setIsVisible,
  setLastSettingsTab,
  setLockVisibilityState,
  setSettingsView,
  SettingsTab,
  SettingsView,
} from '@/redux/slices/navbar';
import { logEvent } from '@/utils/eventLogger';

/**
 * Action source for analytics tracking when closing drawers.
 * Matches the ActionSource enum previously defined in Drawer/index.tsx.
 */
export enum ActionSource {
  Click = 'click',
  EscKey = 'esc_key',
  OutsideClick = 'outside_click',
  Navigation = 'navigation',
}

/**
 * Logs a drawer close event with the action source.
 *
 * @param {string} drawerType - The type of drawer being closed
 * @param {ActionSource} actionSource - The source of the close action
 */
const logDrawerCloseEvent = (drawerType: string, actionSource: ActionSource) => {
  // eslint-disable-next-line i18next/no-literal-string
  logEvent(`drawer_${drawerType}_close_${actionSource}`);
};

/**
 * Shared hook for navbar drawer actions.
 * Used by NavbarBody, MobileStickyItemsBar, and drawer components to ensure consistent behavior.
 *
 * This hook provides a centralized interface for:
 * - Opening/closing all three drawers with analytics
 * - Managing navbar visibility and visibility locking
 * - Managing settings view navigation
 *
 * @returns {object} Object containing drawer action functions
 */
const useNavbarDrawerActions = () => {
  const dispatch = useDispatch();

  // ============ OPEN ACTIONS ============

  const openSearchDrawer = useCallback(() => {
    // eslint-disable-next-line i18next/no-literal-string
    logEvent('drawer_search_open');
    dispatch(setIsSearchDrawerOpen(true));
    // Reset the disable transition state
    dispatch(setDisableSearchDrawerTransition(false));
  }, [dispatch]);

  const openNavigationDrawer = useCallback(() => {
    // eslint-disable-next-line i18next/no-literal-string
    logEvent('drawer_navigation_open');
    dispatch(setIsNavigationDrawerOpen(true));
  }, [dispatch]);

  const openSettingsDrawer = useCallback(() => {
    // eslint-disable-next-line i18next/no-literal-string
    logEvent('drawer_settings_open');
    dispatch(setIsSettingsDrawerOpen(true));
  }, [dispatch]);

  // ============ CLOSE ACTIONS ============

  const closeSearchDrawer = useCallback(
    (actionSource: ActionSource = ActionSource.Click) => {
      logDrawerCloseEvent('search', actionSource);
      dispatch(setIsSearchDrawerOpen(false));
    },
    [dispatch],
  );

  const closeNavigationDrawer = useCallback(
    (actionSource: ActionSource = ActionSource.Click) => {
      logDrawerCloseEvent('navigation', actionSource);
      dispatch(setIsNavigationDrawerOpen(false));
    },
    [dispatch],
  );

  const closeSettingsDrawer = useCallback(
    (actionSource: ActionSource = ActionSource.Click) => {
      logDrawerCloseEvent('settings', actionSource);
      dispatch(setIsSettingsDrawerOpen(false));
    },
    [dispatch],
  );

  // ============ VISIBILITY CONTROL ============

  const setNavbarVisible = useCallback(
    (visible: boolean) => {
      dispatch(setIsVisible(visible));
    },
    [dispatch],
  );

  const lockNavbarVisibility = useCallback(
    (locked: boolean) => {
      dispatch(setLockVisibilityState(locked));
    },
    [dispatch],
  );

  // ============ SETTINGS VIEW MANAGEMENT ============

  const navigateToSettingsView = useCallback(
    (view: SettingsView) => {
      dispatch(setSettingsView(view));
    },
    [dispatch],
  );

  const updateLastSettingsTab = useCallback(
    (tab: SettingsTab) => {
      dispatch(setLastSettingsTab(tab));
    },
    [dispatch],
  );

  const updateDisableSearchDrawerTransition = useCallback(
    (disabled: boolean) => {
      dispatch(setDisableSearchDrawerTransition(disabled));
    },
    [dispatch],
  );

  return {
    // Open
    openSearchDrawer,
    openNavigationDrawer,
    openSettingsDrawer,
    // Close
    closeSearchDrawer,
    closeNavigationDrawer,
    closeSettingsDrawer,
    // Visibility
    setNavbarVisible,
    lockNavbarVisibility,
    // Settings
    navigateToSettingsView,
    updateLastSettingsTab,
    updateDisableSearchDrawerTransition,
  };
};

export default useNavbarDrawerActions;

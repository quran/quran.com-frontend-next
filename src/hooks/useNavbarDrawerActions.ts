import { useCallback } from 'react';

import { useDispatch } from 'react-redux';

import {
  setDisableSearchDrawerTransition,
  setIsNavigationDrawerOpen,
  setIsSearchDrawerOpen,
} from '@/redux/slices/navbar';
import { logEvent } from '@/utils/eventLogger';

/**
 * Shared hook for navbar drawer actions.
 * Used by both NavbarBody and MobileStickyItemsBar to ensure consistent behavior.
 *
 * @returns {object} Object containing openSearchDrawer and openNavigationDrawer functions
 */
const useNavbarDrawerActions = () => {
  const dispatch = useDispatch();

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

  return { openSearchDrawer, openNavigationDrawer };
};

export default useNavbarDrawerActions;

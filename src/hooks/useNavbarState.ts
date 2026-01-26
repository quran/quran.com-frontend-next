import { shallowEqual, useSelector } from 'react-redux';

import { selectNavbar, SettingsTab, SettingsView } from '@/redux/slices/navbar';

export type NavbarState = {
  // Visibility
  isVisible: boolean;
  lockVisibilityState: boolean;

  // Drawer states
  isNavigationDrawerOpen: boolean;
  isSearchDrawerOpen: boolean;
  isSettingsDrawerOpen: boolean;

  // Settings
  settingsView: SettingsView;
  lastSettingsView: SettingsView;
  lastSettingsTab: SettingsTab;

  // Search
  disableSearchDrawerTransition: boolean;
};

/**
 * Facade hook for accessing navbar state.
 * This abstracts Redux implementation details and provides a clean interface
 * for components to access navbar state.
 *
 * Benefits:
 * - Single import instead of multiple Redux imports
 * - Easier to refactor state shape in the future
 * - Type-safe with full TypeScript support
 * - Uses shallowEqual for optimized re-renders
 *
 * @returns {NavbarState} The current navbar state
 */
const useNavbarState = (): NavbarState => {
  const navbar = useSelector(selectNavbar, shallowEqual);

  return {
    // Visibility
    isVisible: navbar.isVisible,
    lockVisibilityState: navbar.lockVisibilityState,

    // Drawer states
    isNavigationDrawerOpen: navbar.isNavigationDrawerOpen,
    isSearchDrawerOpen: navbar.isSearchDrawerOpen,
    isSettingsDrawerOpen: navbar.isSettingsDrawerOpen,

    // Settings
    settingsView: navbar.settingsView,
    lastSettingsView: navbar.lastSettingsView,
    lastSettingsTab: navbar.lastSettingsTab,

    // Search
    disableSearchDrawerTransition: navbar.disableSearchDrawerTransition,
  };
};

export default useNavbarState;

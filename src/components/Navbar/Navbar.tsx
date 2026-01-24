import React from 'react';

import classNames from 'classnames';
import { useSelector, shallowEqual } from 'react-redux';

import MobileStickyItemsBar from './MobileStickyItemsBar';
import styles from './Navbar.module.scss';
import NavbarBody from './NavbarBody';
import NavigationDrawer from './NavigationDrawer/NavigationDrawer';
import SearchDrawer from './SearchDrawer/SearchDrawer';
import SettingsDrawer from './SettingsDrawer/SettingsDrawer';

import { useOnboarding } from '@/components/Onboarding/OnboardingProvider';
import useDebounceNavbarVisibility from '@/hooks/useDebounceNavbarVisibility';
import { selectIsBannerVisible } from '@/redux/slices/banner';
import {
  selectIsNavigationDrawerOpen,
  selectIsSettingsDrawerOpen,
  selectNavbar,
} from '@/redux/slices/navbar';

const Navbar = () => {
  const { isActive } = useOnboarding();
  const { isVisible: isNavbarVisible } = useSelector(selectNavbar, shallowEqual);
  const isBannerVisible = useSelector(selectIsBannerVisible);
  const isNavigationDrawerOpen = useSelector(selectIsNavigationDrawerOpen);
  const isSettingsDrawerOpen = useSelector(selectIsSettingsDrawerOpen);
  // Use the shared hook to debounce navbar visibility changes
  const showNavbar = useDebounceNavbarVisibility(isNavbarVisible, isActive);

  return (
    <>
      <MobileStickyItemsBar />
      <div className={styles.emptySpacePlaceholder} />
      <nav
        className={classNames(styles.container, {
          [styles.hiddenNav]: !showNavbar,
          [styles.dimmed]: isNavigationDrawerOpen || isSettingsDrawerOpen,
        })}
        data-testid="navbar"
        data-isvisible={showNavbar}
      >
        <NavbarBody isBannerVisible={isBannerVisible} />
      </nav>
      {/* Drawers rendered outside nav to avoid transform containment issues */}
      <SearchDrawer />
      <SettingsDrawer />
      <NavigationDrawer />
    </>
  );
};

export default Navbar;

import React from 'react';

import classNames from 'classnames';
import { useSelector, shallowEqual } from 'react-redux';

import styles from './Navbar.module.scss';
import NavbarBody from './NavbarBody';

import { useOnboarding } from '@/components/Onboarding/OnboardingProvider';
import useScrollBarWidth from '@/hooks/useScrollBarWidth';
import { selectNavbar } from '@/redux/slices/navbar';

const Navbar = () => {
  const { isActive } = useOnboarding();
  const {
    isVisible: isNavbarVisible,
    isSettingsDrawerOpen,
    isNavigationDrawerOpen,
    isSearchDrawerOpen,
  } = useSelector(selectNavbar, shallowEqual);
  const showNavbar = isNavbarVisible || isActive;

  useScrollBarWidth();

  return (
    <>
      <div className={styles.emptySpacePlaceholder} />
      <nav
        className={classNames(styles.container, {
          [styles.hiddenNav]: !showNavbar,
          [styles.noScrollbarWidth]:
            isSettingsDrawerOpen || isNavigationDrawerOpen || isSearchDrawerOpen,
        })}
      >
        <NavbarBody />
      </nav>
    </>
  );
};

export default Navbar;

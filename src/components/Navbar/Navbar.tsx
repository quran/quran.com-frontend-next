import React, { useEffect } from 'react';

import classNames from 'classnames';
import { useSelector, shallowEqual } from 'react-redux';

import styles from './Navbar.module.scss';
import NavbarBody from './NavbarBody';

import { useOnboarding } from '@/components/Onboarding/OnboardingProvider';
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

  useEffect(() => {
    const getScrollbarWidth = () => {
      return window.innerWidth - document.documentElement.clientWidth;
    };

    const setScrollbarWidth = () => {
      const scrollbarWidth = getScrollbarWidth();
      document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
    };

    setScrollbarWidth(); // Set the scrollbar width initially

    window.addEventListener('resize', setScrollbarWidth); // Update the scrollbar width when the window is resized

    return () => {
      window.removeEventListener('resize', setScrollbarWidth);
    };
  }, []);

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

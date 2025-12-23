import React from 'react';

import classNames from 'classnames';
import { useSelector, shallowEqual } from 'react-redux';

import styles from './Navbar.module.scss';
import NavbarBody from './NavbarBody';

import { useOnboarding } from '@/components/Onboarding/OnboardingProvider';
import useDebounceNavbarVisibility from '@/hooks/useDebounceNavbarVisibility';
import { selectIsBannerVisible } from '@/redux/slices/banner';
import { selectNavbar } from '@/redux/slices/navbar';

const Navbar = () => {
  const { isActive } = useOnboarding();
  const { isVisible: isNavbarVisible } = useSelector(selectNavbar, shallowEqual);
  const isBannerVisible = useSelector(selectIsBannerVisible);
  // Use the shared hook to debounce navbar visibility changes
  const showNavbar = useDebounceNavbarVisibility(isNavbarVisible, isActive);

  return (
    <div className={classNames({ [styles.bannerActive]: isBannerVisible })}>
      <div className={styles.emptySpacePlaceholder} />
      <nav
        className={classNames(styles.container, { [styles.hiddenNav]: !showNavbar })}
        data-testid="navbar"
        data-quran-navbar="true"
        data-isvisible={showNavbar}
      >
        <NavbarBody isBannerVisible={isBannerVisible} />
      </nav>
    </div>
  );
};

export default Navbar;

import React from 'react';

import classNames from 'classnames';
import { useSelector, shallowEqual } from 'react-redux';

import FundraisingStickyBanner from '../Fundaraising/FundraisingStickyBanner';

import styles from './Navbar.module.scss';
import NavbarBody from './NavbarBody';

import { selectIsBannerVisible } from 'src/redux/slices/banner';
import { selectNavbar } from 'src/redux/slices/navbar';

const Navbar = () => {
  const { isVisible: isNavbarVisible } = useSelector(selectNavbar, shallowEqual);
  const isBannerVisible = useSelector(selectIsBannerVisible);
  return (
    <>
      <div className={styles.emptySpacePlaceholder} />
      <nav className={classNames(styles.container, { [styles.hiddenNav]: !isNavbarVisible })}>
        {isBannerVisible && <FundraisingStickyBanner />}
        <NavbarBody />
      </nav>
    </>
  );
};

export default Navbar;

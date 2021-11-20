import React from 'react';

import classNames from 'classnames';
import { useSelector, shallowEqual } from 'react-redux';

import styles from './Navbar.module.scss';
import NavbarBody from './NavbarBody';

import { selectNavbar } from 'src/redux/slices/navbar';

const Navbar = () => {
  const { isVisible } = useSelector(selectNavbar, shallowEqual);
  return (
    <>
      <div className={styles.emptySpacePlaceholder} />
      <nav className={classNames(styles.container, { [styles.hiddenNav]: !isVisible })}>
        <NavbarBody />
      </nav>
    </>
  );
};

export default Navbar;

import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector, shallowEqual } from 'react-redux';

import Banner from '../Banner/Banner';

import styles from './Navbar.module.scss';
import NavbarBody from './NavbarBody';

import { selectNavbar } from 'src/redux/slices/navbar';

const Navbar = () => {
  const { t } = useTranslation('common');
  const { isVisible: isNavbarVisible } = useSelector(selectNavbar, shallowEqual);
  return (
    <>
      <div className={styles.emptySpacePlaceholder} />
      <nav className={classNames(styles.container, { [styles.hiddenNav]: !isNavbarVisible })}>
        <Banner text={t('fundraising-sticky-banner.title')} />
        <NavbarBody />
      </nav>
    </>
  );
};

export default Navbar;

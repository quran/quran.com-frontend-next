import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector, shallowEqual } from 'react-redux';

import styles from './Navbar.module.scss';
import NavbarBody from './NavbarBody';

import Banner from '@/components/Banner/Banner';
import DonateButton from '@/components/Fundraising/DonateButton';
import { selectNavbar } from '@/redux/slices/navbar';
import DonateButtonClickSource from '@/types/DonateButtonClickSource';

const Navbar = () => {
  const { t } = useTranslation('common');
  const { isVisible: isNavbarVisible } = useSelector(selectNavbar, shallowEqual);
  return (
    <>
      <div className={styles.emptySpacePlaceholder} />
      <nav className={classNames(styles.container, { [styles.hiddenNav]: !isNavbarVisible })}>
        <Banner
          text={t('fundraising-sticky-banner.title')}
          ctaButton={<DonateButton source={DonateButtonClickSource.BANNER} />}
        />
        <NavbarBody />
      </nav>
    </>
  );
};

export default Navbar;

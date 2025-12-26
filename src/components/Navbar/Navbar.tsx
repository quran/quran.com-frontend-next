import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector, shallowEqual } from 'react-redux';

import Banner from '../Banner/Banner';

import styles from './Navbar.module.scss';
import NavbarBody from './NavbarBody';

import { useOnboarding } from '@/components/Onboarding/OnboardingProvider';
import { selectNavbar } from '@/redux/slices/navbar';

const Navbar = () => {
  const { t } = useTranslation('common');
  const { isActive } = useOnboarding();
  const { isVisible: isNavbarVisible } = useSelector(selectNavbar, shallowEqual);
  const showNavbar = isNavbarVisible || isActive;

  return (
    <>
      <div className={styles.emptySpacePlaceholder} />
      <nav className={classNames(styles.container, { [styles.hiddenNav]: !showNavbar })}>
        <Banner text={t('fundraising.donation-campaign.text')} shouldShowPrefixIcon={false} />
        <NavbarBody />
      </nav>
    </>
  );
};

export default Navbar;

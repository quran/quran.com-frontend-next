import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector, shallowEqual } from 'react-redux';

import styles from './Navbar.module.scss';
import NavbarBody from './NavbarBody';

import Banner from '@/components/Banner/Banner';
import DonateButton from '@/components/Fundraising/DonateButton';
import { useOnboarding } from '@/components/Onboarding/OnboardingProvider';
import { selectNavbar } from '@/redux/slices/navbar';
import DonateButtonClickSource from '@/types/DonateButtonClickSource';
import DonateButtonType from '@/types/DonateButtonType';

const Navbar = () => {
  const { isActive } = useOnboarding();
  const { t } = useTranslation('common');
  const { isVisible: isNavbarVisible } = useSelector(selectNavbar, shallowEqual);
  const showNavbar = isNavbarVisible || isActive;

  return (
    <>
      <div className={styles.emptySpacePlaceholder} />
      <nav className={classNames(styles.container, { [styles.hiddenNav]: !showNavbar })}>
        <Banner
          text={t('fundraising-sticky-banner.title')}
          ctaButton={
            <DonateButton type={DonateButtonType.MONTHLY} source={DonateButtonClickSource.BANNER} />
          }
        />
        <NavbarBody />
      </nav>
    </>
  );
};

export default Navbar;

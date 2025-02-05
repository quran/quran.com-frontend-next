import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector, shallowEqual } from 'react-redux';

import styles from './Navbar.module.scss';
import NavbarBody from './NavbarBody';

import Banner from '@/components/Banner/Banner';
import { useOnboarding } from '@/components/Onboarding/OnboardingProvider';
import Button, { ButtonSize, ButtonType } from '@/dls/Button/Button';
import { selectNavbar } from '@/redux/slices/navbar';
import { getRamadanNavigationUrl } from '@/utils/navigation';

const Navbar = () => {
  const { isActive } = useOnboarding();
  const { isVisible: isNavbarVisible } = useSelector(selectNavbar, shallowEqual);
  const { t } = useTranslation('common');
  const showNavbar = isNavbarVisible || isActive;

  return (
    <>
      <div className={styles.emptySpacePlaceholder} />
      <nav className={classNames(styles.container, { [styles.hiddenNav]: !showNavbar })}>
        <Banner
          shouldShowPrefixIcon={false}
          text={`✨ ${t('ready-for-ramadan')}`}
          ctaButton={
            <Button
              href={getRamadanNavigationUrl()}
              size={ButtonSize.Small}
              type={ButtonType.Success}
            >
              {`${t('get-started')}!`}
            </Button>
          }
        />

        <NavbarBody />
      </nav>
    </>
  );
};

export default Navbar;

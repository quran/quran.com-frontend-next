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
import { getProductUpdatesUrl } from '@/utils/navigation';

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
          text={`🎉 ${t('exciting-updates')}!`}
          ctaButton={
            <Button href={getProductUpdatesUrl()} size={ButtonSize.Small} type={ButtonType.Success}>
              {t('see-new')}
            </Button>
          }
        />
        <NavbarBody />
      </nav>
    </>
  );
};

export default Navbar;

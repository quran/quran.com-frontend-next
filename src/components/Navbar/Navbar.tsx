import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import styles from './Navbar.module.scss';
import NavbarBody from './NavbarBody';

import Banner from '@/components/Banner/Banner';
import { useOnboarding } from '@/components/Onboarding/OnboardingProvider';
import Button, { ButtonShape, ButtonSize, ButtonType } from '@/dls/Button/Button';
import DiamondIcon from '@/icons/diamond.svg';
import { selectNavbar } from '@/redux/slices/navbar';
import { makeDonatePageUrl } from '@/utils/apiPaths';
import { logButtonClick } from '@/utils/eventLogger';

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
          text={t('best-days-banner')}
          ctaButton={
            <Button
              href={makeDonatePageUrl(false, true)}
              onClick={() => {
                logButtonClick('navbar_best_days');
              }}
              isNewTab
              size={ButtonSize.Small}
              type={ButtonType.Primary}
              shape={ButtonShape.Pill}
              className={styles.donateButton}
              prefix={<DiamondIcon />}
            >
              {t('donate')}
            </Button>
          }
        />

        <NavbarBody />
      </nav>
    </>
  );
};

export default Navbar;

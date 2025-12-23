import { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import styles from './NavbarLogoWrapper.module.scss';

import Link from '@/dls/Link/Link';
import QuranTextLogo from '@/icons/quran-text-logo.svg';
import { setIsSidebarNavigationVisible } from '@/redux/slices/QuranReader/sidebarNavigation';

const NavbarLogoWrapper = () => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const handleLogoClick = useCallback(() => {
    // Ensure sidebar is closed when navigating home via the logo
    dispatch(setIsSidebarNavigationVisible(false));
  }, [dispatch]);

  return (
    <Link href="/" className={styles.logoWrapper} title={t('quran-com')} onClick={handleLogoClick}>
      <QuranTextLogo />
    </Link>
  );
};

export default NavbarLogoWrapper;

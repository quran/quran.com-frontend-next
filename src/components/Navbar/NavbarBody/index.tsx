import { memo } from 'react';

import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import styles from './NavbarBody.module.scss';
import ProfileAvatarButton from './ProfileAvatarButton';

import LanguageSelector from '@/components/Navbar/LanguageSelector';
import NavbarLogoWrapper from '@/components/Navbar/Logo/NavbarLogoWrapper';
import NavigationDrawer from '@/components/Navbar/NavigationDrawer/NavigationDrawer';
import SearchDrawer from '@/components/Navbar/SearchDrawer/SearchDrawer';
import SettingsDrawer from '@/components/Navbar/SettingsDrawer/SettingsDrawer';
import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import Spinner from '@/dls/Spinner/Spinner';
import IconMenu from '@/icons/menu.svg';
import IconSearch from '@/icons/search.svg';
import IconSettings from '@/icons/settings.svg';
import {
  setIsSearchDrawerOpen,
  setIsNavigationDrawerOpen,
  setIsSettingsDrawerOpen,
  setDisableSearchDrawerTransition,
} from '@/redux/slices/navbar';
import { logEvent } from '@/utils/eventLogger';

const SidebarNavigation = dynamic(
  () => import('@/components/QuranReader/SidebarNavigation/SidebarNavigation'),
  {
    ssr: false,
    loading: () => <Spinner />,
  },
);

/**
 * Log drawer events.
 *
 * @param {string} drawerName
 */
const logDrawerOpenEvent = (drawerName: string) => {
  // eslint-disable-next-line i18next/no-literal-string
  logEvent(`drawer_${drawerName}_open`);
};

const NavbarBody: React.FC = () => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const openNavigationDrawer = () => {
    logDrawerOpenEvent('navigation');
    dispatch({ type: setIsNavigationDrawerOpen.type, payload: true });
  };

  const openSearchDrawer = () => {
    logDrawerOpenEvent('search');
    dispatch({ type: setIsSearchDrawerOpen.type, payload: true });
    // reset the disable transition state
    dispatch({ type: setDisableSearchDrawerTransition.type, payload: false });
  };

  const openSettingsDrawer = () => {
    logDrawerOpenEvent('settings');
    dispatch({ type: setIsSettingsDrawerOpen.type, payload: true });
  };

  return (
    <div className={styles.itemsContainer}>
      <div className={styles.centerVertically}>
        <div className={styles.leftCTA}>
          <>
            <Button
              tooltip={t('menu')}
              variant={ButtonVariant.Ghost}
              shape={ButtonShape.Circle}
              onClick={openNavigationDrawer}
              ariaLabel={t('aria.nav-drawer-open')}
            >
              <IconMenu />
            </Button>
            <NavigationDrawer />
          </>
          <NavbarLogoWrapper />
        </div>
      </div>
      <div className={styles.centerVertically}>
        <div className={styles.rightCTA}>
          <>
            <ProfileAvatarButton />
            <LanguageSelector />
            <Button
              tooltip={t('settings.title')}
              shape={ButtonShape.Circle}
              variant={ButtonVariant.Ghost}
              onClick={openSettingsDrawer}
              ariaLabel={t('aria.change-settings')}
              id="settings-button"
            >
              <IconSettings />
            </Button>
            <SettingsDrawer />
          </>
          <>
            <Button
              tooltip={t('search.title')}
              variant={ButtonVariant.Ghost}
              onClick={openSearchDrawer}
              shape={ButtonShape.Circle}
              shouldFlipOnRTL={false}
              ariaLabel={t('search.title')}
            >
              <IconSearch />
            </Button>
            <SearchDrawer />
            <SidebarNavigation />
          </>
        </div>
      </div>
    </div>
  );
};

export default memo(NavbarBody);

import { memo } from 'react';

import classNames from 'classnames';
import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import SettingsDrawer from '../SettingsDrawer/SettingsDrawer';

import styles from './NavbarBody.module.scss';
import ProfileAvatarButton from './ProfileAvatarButton';

import NavbarLogoWrapper from '@/components/Navbar/Logo/NavbarLogoWrapper';
import NavigationDrawer from '@/components/Navbar/NavigationDrawer/NavigationDrawer';
import SearchDrawer from '@/components/Navbar/SearchDrawer/SearchDrawer';
import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import Spinner from '@/dls/Spinner/Spinner';
import IconMenu from '@/icons/menu.svg';
import IconSearch from '@/icons/search.svg';
import {
  selectIsNavigationDrawerOpen,
  setIsSearchDrawerOpen,
  setIsNavigationDrawerOpen,
  setDisableSearchDrawerTransition,
  setIsNavigationDrawerOpen,
  setIsSearchDrawerOpen,
} from '@/redux/slices/navbar';
import { isLoggedIn } from '@/utils/auth/login';
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
  const isNavigationDrawerOpen = useSelector(selectIsNavigationDrawerOpen);
  const loggedIn = isLoggedIn();

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

  return (
    <div
      className={classNames(styles.itemsContainer, {
        [styles.dimmed]: isNavigationDrawerOpen,
      })}
      inert={isNavigationDrawerOpen || undefined}
    >
      <div className={styles.centerVertically}>
        <div className={styles.leftCTA}>
          <NavbarLogoWrapper />
        </div>
      </div>
      <div className={styles.centerVertically}>
        <div className={styles.rightCTA}>
          {!loggedIn && <ProfileAvatarButton />}
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
          {loggedIn && <ProfileAvatarButton />}
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
        </div>
      </div>
    </div>
  );
};

export default memo(NavbarBody);

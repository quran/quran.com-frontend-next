import React, { memo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import IconMenu from '../../../../public/icons/menu.svg';
import IconSearch from '../../../../public/icons/search.svg';
import IconSettings from '../../../../public/icons/settings.svg';
import LanguageSelector from '../LanguageSelector';
import NavbarLogoWrapper from '../Logo/NavbarLogoWrapper';
import NavigationDrawer from '../NavigationDrawer/NavigationDrawer';
import SearchDrawer from '../SearchDrawer/SearchDrawer';
import SettingsDrawer from '../SettingsDrawer/SettingsDrawer';

import styles from './NavbarBody.module.scss';

import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';
import {
  setIsSearchDrawerOpen,
  setIsNavigationDrawerOpen,
  setIsSettingsDrawerOpen,
} from 'src/redux/slices/navbar';
import { logEvent } from 'src/utils/eventLogger';

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
            <LanguageSelector />
            <Button
              tooltip={t('settings.title')}
              shape={ButtonShape.Circle}
              variant={ButtonVariant.Ghost}
              onClick={openSettingsDrawer}
              ariaLabel={t('aria.change-settings')}
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
          </>
        </div>
      </div>
    </div>
  );
};

export default memo(NavbarBody);

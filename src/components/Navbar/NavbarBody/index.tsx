import React, { memo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';
import { useDispatch } from 'react-redux';

import IconMenu from '../../../../public/icons/menu.svg';
import QuranTextLogo from '../../../../public/icons/quran-text-logo.svg';
import IconSearch from '../../../../public/icons/search.svg';
import IconSettings from '../../../../public/icons/settings.svg';
import LanguageSelector from '../LanguageSelector';
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

const NavbarBody: React.FC = () => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const openNavigationDrawer = () => {
    dispatch({ type: setIsNavigationDrawerOpen.type, payload: true });
  };

  const openSearchDrawer = () => {
    dispatch({ type: setIsSearchDrawerOpen.type, payload: true });
  };

  const openSettingsDrawer = () => {
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
            >
              <IconMenu />
            </Button>
            <NavigationDrawer />
          </>
          <Link href="/">
            <a className={styles.logoWrapper}>
              <QuranTextLogo />
            </a>
          </Link>
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

import React, { memo } from 'react';

import dynamic from 'next/dynamic';
import { useDispatch, useSelector } from 'react-redux';

import IconMenu from '../../../../public/icons/menu.svg';
import IconQ from '../../../../public/icons/Q.svg';
import IconSearch from '../../../../public/icons/search.svg';
import IconSettings from '../../../../public/icons/settings.svg';
import LanguageSelector from '../LanguageSelector';

import styles from './NavbarBody.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from 'src/components/dls/Button/Button';
import {
  selectNavbar,
  setIsSearchDrawerOpen,
  setIsNavigationDrawerOpen,
  setIsSettingsDrawerOpen,
} from 'src/redux/slices/navbar';

const SearchDrawer = dynamic(() => import('../SearchDrawer/SearchDrawer'), {
  ssr: false,
});
const SettingsDrawer = dynamic(() => import('../SettingsDrawer/SettingsDrawer'), {
  ssr: false,
});
const NavigationDrawer = dynamic(() => import('../NavigationDrawer/NavigationDrawer'), {
  ssr: false,
});

const NavbarBody: React.FC = () => {
  const dispatch = useDispatch();
  const { isNavigationDrawerOpen, isSettingsDrawerOpen, isSearchDrawerOpen } =
    useSelector(selectNavbar);
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
              tooltip="Menu"
              variant={ButtonVariant.Ghost}
              shape={ButtonShape.Circle}
              onClick={openNavigationDrawer}
            >
              <IconMenu />
            </Button>
            {isNavigationDrawerOpen && <NavigationDrawer />}
          </>
          <Button
            href="/"
            shape={ButtonShape.Circle}
            variant={ButtonVariant.Ghost}
            className={styles.logoWrapper}
            size={ButtonSize.Large}
          >
            <IconQ />
          </Button>
          <div className={styles.betaLabel}>BETA</div>
          <LanguageSelector />
        </div>
      </div>
      <div className={styles.centerVertically}>
        <div className={styles.rightCTA}>
          <>
            <Button
              tooltip="Settings"
              shape={ButtonShape.Circle}
              variant={ButtonVariant.Ghost}
              onClick={openSettingsDrawer}
            >
              <IconSettings />
            </Button>
            {isSettingsDrawerOpen && <SettingsDrawer />}
          </>
          <>
            <Button
              tooltip="Search"
              variant={ButtonVariant.Ghost}
              onClick={openSearchDrawer}
              shape={ButtonShape.Circle}
            >
              <IconSearch />
            </Button>
            {isSearchDrawerOpen && <SearchDrawer />}
          </>
        </div>
      </div>
    </div>
  );
};

export default memo(NavbarBody);

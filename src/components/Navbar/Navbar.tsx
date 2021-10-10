import React from 'react';

import classNames from 'classnames';
import Link from 'next/link';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';

import IconMenu from '../../../public/icons/menu.svg';
import IconQ from '../../../public/icons/Q.svg';
import IconSearch from '../../../public/icons/search.svg';
import IconSettings from '../../../public/icons/settings.svg';

import LanguageSelector from './LanguageSelector';
import styles from './Navbar.module.scss';
import NavigationDrawer from './NavigationDrawer/NavigationDrawer';
import SearchDrawer from './SearchDrawer/SearchDrawer';
import SettingsDrawer from './SettingsDrawer/SettingsDrawer';

import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';
import {
  selectNavbar,
  setIsSearchDrawerOpen,
  setIsNavigationDrawerOpen,
  setIsSettingsDrawerOpen,
} from 'src/redux/slices/navbar';

const Navbar = () => {
  const { isVisible } = useSelector(selectNavbar, shallowEqual);
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
    <>
      <div className={styles.emptySpacePlaceholder} />
      <nav className={classNames(styles.container, { [styles.hiddenNav]: !isVisible })}>
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
                <NavigationDrawer />
              </>
              <Link href="/">
                <a>
                  <Button shape={ButtonShape.Circle} variant={ButtonVariant.Ghost}>
                    <IconQ />
                  </Button>
                </a>
              </Link>
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
                <SettingsDrawer />
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
                <SearchDrawer />
              </>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;

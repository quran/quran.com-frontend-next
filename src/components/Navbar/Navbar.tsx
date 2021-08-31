import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectNavbar,
  setIsSearchDrawerOpen,
  setIsNavigationDrawerOpen,
  setIsSettingsDrawerOpen,
} from 'src/redux/slices/navbar';
import Link from 'next/link';
import classNames from 'classnames';
import Button, { ButtonShape, ButtonVariant } from '../dls/Button/Button';
import LanguageSelector from './LanguageSelector';
import IconSettings from '../../../public/icons/settings.svg';
import IconSearch from '../../../public/icons/search.svg';
import IconMenu from '../../../public/icons/menu.svg';
import IconQ from '../../../public/icons/Q.svg';
import NavigationDrawer from './NavigationDrawer/NavigationDrawer';
import SearchDrawer from './SearchDrawer/SearchDrawer';
import styles from './Navbar.module.scss';
import SettingsDrawer from './SettingsDrawer/SettingsDrawer';

const Navbar = () => {
  const { isVisible } = useSelector(selectNavbar);

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
    <nav className={classNames(styles.styledNav, { [styles.styledNavHidden]: !isVisible })}>
      {isVisible && (
        <div className={styles.itemsContainer}>
          <div className={styles.centerVertically}>
            <div className={styles.leftCTA}>
              <>
                <Button
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
      )}
    </nav>
  );
};

export default Navbar;

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectNavbar,
  setIsSearchDrawerOpen,
  setIsNavigationDrawerOpen,
} from 'src/redux/slices/navbar';
import Link from 'next/link';
import classNames from 'classnames';
import Button, { ButtonSize } from '../dls/Button/Button';
import LanuageSelector from './LanguageSelector';
import IconSettings from '../../../public/icons/settings.svg';
import IconReader from '../../../public/icons/reader.svg';
import IconSearch from '../../../public/icons/search.svg';
import IconMenu from '../../../public/icons/menu.svg';
import IconQ from '../../../public/icons/Q.svg';
import NavigationDrawer from './NavigationDrawer/NavigationDrawer';
import SearchDrawer from './SearchDrawer/SearchDrawer';
import styles from './navbar.module.scss';

const Navbar = () => {
  const { isVisible } = useSelector(selectNavbar);

  const dispatch = useDispatch();

  const openNavigationDrawer = () => {
    dispatch({ type: setIsNavigationDrawerOpen.type, payload: true });
  };

  const openSearchDrawer = () => {
    dispatch({ type: setIsSearchDrawerOpen.type, payload: true });
  };

  return (
    <nav className={classNames(styles.styledNav, { [styles.styledNavHidden]: !isVisible })}>
      {isVisible && (
        <div className={styles.itemsContainer}>
          <div className={styles.centerVertically}>
            <div className={styles.leftCTA}>
              <>
                <Button
                  icon={<IconMenu />}
                  size={ButtonSize.Small}
                  onClick={openNavigationDrawer}
                />
                <NavigationDrawer />
              </>
              <Link href="/">
                <a>
                  <Button icon={<IconQ />} size={ButtonSize.Small} />
                </a>
              </Link>
              <LanuageSelector />
            </div>
          </div>
          <div className={styles.centerVertically}>
            <div className={styles.rightCTA}>
              <Button icon={<IconSettings />} size={ButtonSize.Small} />
              <Button icon={<IconReader />} size={ButtonSize.Small} />
              <>
                <Button icon={<IconSearch />} size={ButtonSize.Small} onClick={openSearchDrawer} />
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

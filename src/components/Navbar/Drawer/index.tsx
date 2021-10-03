import React, { useRef, useEffect, useCallback, ReactNode } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import styles from './Drawer.module.scss';
import DrawerCloseButton from './DrawerCloseButton';

import useKeyPressedDetector from 'src/hooks/useKeyPressedDetector';
import useOutsideClickDetector from 'src/hooks/useOutsideClickDetector';
import {
  Navbar,
  selectNavbar,
  setIsNavigationDrawerOpen,
  setIsSearchDrawerOpen,
  setIsSettingsDrawerOpen,
} from 'src/redux/slices/navbar';

export enum DrawerType {
  Navigation = 'navigation',
  Search = 'search',
  Settings = 'settings',
}

export enum DrawerSide {
  Left = 'left',
  Right = 'right',
}

interface Props {
  type: DrawerType;
  side?: DrawerSide;
  header: ReactNode;
  children: ReactNode;
}

/**
 * Check whether a specific drawer is open or not based on the type.
 *
 * @param {DrawerType} type
 * @param {Navbar} navbar
 * @returns {boolean}
 */
const getIsOpen = (type: DrawerType, navbar: Navbar): boolean => {
  const { isNavigationDrawerOpen, isSettingsDrawerOpen, isSearchDrawerOpen } = navbar;
  if (type === DrawerType.Navigation) {
    return isNavigationDrawerOpen;
  }
  if (type === DrawerType.Settings) {
    return isSettingsDrawerOpen;
  }
  return isSearchDrawerOpen;
};

const getActionCreator = (type: DrawerType) => {
  if (type === DrawerType.Navigation) {
    return setIsNavigationDrawerOpen.type;
  }
  if (type === DrawerType.Settings) {
    return setIsSettingsDrawerOpen.type;
  }
  return setIsSearchDrawerOpen.type;
};

const Drawer: React.FC<Props> = ({ type, side = DrawerSide.Right, header, children }) => {
  const drawerRef = useRef(null);
  const dispatch = useDispatch();
  const navbar = useSelector(selectNavbar, shallowEqual);
  const { isVisible } = navbar;
  const isOpen = getIsOpen(type, navbar);
  const router = useRouter();

  const isEscapeKeyPressed = useKeyPressedDetector('Escape', isOpen);
  const closeDrawer = useCallback(() => {
    dispatch({ type: getActionCreator(type), payload: false });
  }, [dispatch, type]);

  // listen to any changes of escape key being pressed.
  useEffect(() => {
    // if we allow closing the modal by keyboard and also ESCAPE key has been pressed, we close the modal.
    if (isEscapeKeyPressed === true) {
      closeDrawer();
    }
  }, [closeDrawer, isEscapeKeyPressed]);

  // Hide navbar after successful navigation
  useEffect(() => {
    router.events.on('routeChangeComplete', () => {
      if (isOpen) {
        closeDrawer();
      }
    });
  }, [closeDrawer, router.events, isOpen]);

  useOutsideClickDetector(drawerRef, closeDrawer, isOpen);
  return (
    <div
      className={classNames(styles.container, {
        [styles.containerOpen]: isOpen,
        [styles.hiddenNavbar]: !isVisible,
        [styles.left]: side === DrawerSide.Left,
        [styles.right]: side === DrawerSide.Right,
      })}
      ref={drawerRef}
    >
      <div className={styles.header}>
        <div className={styles.headerContentContainer}>
          <div className={styles.headerContent}>
            {header}
            <DrawerCloseButton onClick={closeDrawer} />
          </div>
        </div>
      </div>
      <div
        className={classNames(styles.bodyContainer, {
          [styles.navigationBodyContainer]: type === DrawerType.Navigation,
        })}
      >
        {children}
      </div>
    </div>
  );
};

export default Drawer;

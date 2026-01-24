/* eslint-disable react/no-multi-comp */
import React from 'react';

import dynamic from 'next/dynamic';
import { shallowEqual, useSelector } from 'react-redux';

import Drawer, { DrawerSide, DrawerType } from '../Drawer';
import NavbarLogoWrapper from '../Logo/NavbarLogoWrapper';
import ProfileAvatarButton from '../NavbarBody/ProfileAvatarButton';

import styles from './NavigationDrawer.module.scss';
import NavigationDrawerBodySkeleton from './NavigationDrawerBodySkeleton';

import { selectNavbar } from '@/redux/slices/navbar';
import { isLoggedIn } from '@/utils/auth/login';

const NavigationDrawerBody = dynamic(() => import('./NavigationDrawerBody'), {
  ssr: false,
  loading: () => <NavigationDrawerBodySkeleton />,
});

const NavigationDrawer = () => {
  const { isNavigationDrawerOpen } = useSelector(selectNavbar, shallowEqual);
  const isUserLoggedIn = isLoggedIn();

  return (
    <Drawer
      id="navigation-drawer"
      data-testid="navigation-drawer"
      type={DrawerType.Navigation}
      side={DrawerSide.Right}
      header={
        <div className={styles.centerVertically}>
          <div className={styles.leftCTA}>
            <NavbarLogoWrapper />
            {!isUserLoggedIn && <ProfileAvatarButton isPopoverPortalled={false} />}
          </div>
        </div>
      }
    >
      {isNavigationDrawerOpen && <NavigationDrawerBody />}
    </Drawer>
  );
};

export default NavigationDrawer;

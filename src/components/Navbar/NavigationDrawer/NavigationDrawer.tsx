/* eslint-disable react/no-multi-comp */
import React from 'react';

import dynamic from 'next/dynamic';
import { shallowEqual, useSelector } from 'react-redux';

import Drawer, { DrawerSide, DrawerType } from '../Drawer';
import NavbarLogoWrapper from '../Logo/NavbarLogoWrapper';

import styles from './NavigationDrawer.module.scss';
import NavigationDrawerBodySkeleton from './NavigationDrawerBodySkeleton';

import { selectNavbar } from '@/redux/slices/navbar';

const NavigationDrawerBody = dynamic(() => import('./NavigationDrawerBody'), {
  ssr: false,
  loading: () => <NavigationDrawerBodySkeleton />,
});

const NavigationDrawer = () => {
  const { isNavigationDrawerOpen } = useSelector(selectNavbar, shallowEqual);

  return (
    <Drawer
      type={DrawerType.Navigation}
      side={DrawerSide.Left}
      header={
        <div className={styles.centerVertically}>
          <div className={styles.leftCTA}>
            <NavbarLogoWrapper />
          </div>
        </div>
      }
    >
      {isNavigationDrawerOpen && <NavigationDrawerBody />}
    </Drawer>
  );
};

export default NavigationDrawer;

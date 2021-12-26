/* eslint-disable react/no-multi-comp */
import React from 'react';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { shallowEqual, useSelector } from 'react-redux';

import QuranTextLogo from '../../../../public/icons/quran-text-logo.svg';
import Drawer, { DrawerSide, DrawerType } from '../Drawer';

import styles from './NavigationDrawer.module.scss';
import NavigationDrawerBodySkeleton from './NavigationDrawerBodySkeleton';

import { selectNavbar } from 'src/redux/slices/navbar';

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
            <Link href="/">
              <a className={styles.logoLink}>
                <QuranTextLogo />
              </a>
            </Link>
          </div>
        </div>
      }
    >
      {isNavigationDrawerOpen && <NavigationDrawerBody />}
    </Drawer>
  );
};

export default NavigationDrawer;

/* eslint-disable react/no-multi-comp */
import React from 'react';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { shallowEqual, useSelector } from 'react-redux';

import IconQ from '../../../../public/icons/Q_simple.svg';
import Drawer, { DrawerSide, DrawerType } from '../Drawer';

import styles from './NavigationDrawer.module.scss';

import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';
import Spinner from 'src/components/dls/Spinner/Spinner';
import { selectNavbar } from 'src/redux/slices/navbar';

const NavigationDrawerBody = dynamic(() => import('./NavigationDrawerBody'), {
  ssr: false,
  loading: () => <Spinner />,
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
              <a>
                <Button
                  shape={ButtonShape.Circle}
                  variant={ButtonVariant.Ghost}
                  shouldFlipOnRTL={false}
                >
                  <IconQ />
                </Button>
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

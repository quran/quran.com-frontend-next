/* eslint-disable react/no-multi-comp */
import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import dynamic from 'next/dynamic';
import { useDispatch, useSelector } from 'react-redux';

import Spinner from 'src/components/dls/Spinner/Spinner';
import Drawer, { DrawerType } from 'src/components/Navbar/Drawer';
import { selectNavbar, setSettingsView, SettingsView } from 'src/redux/slices/navbar';

const SettingsBody = dynamic(() => import('./SettingsBody'), {
  ssr: false,
  loading: () => <Spinner />,
});

const SettingsReciter = dynamic(() => import('./SettingsReciter'), {
  ssr: false,
});

const SettingsTranslation = dynamic(() => import('./SettingsTranslation'), {
  ssr: false,
});

const SettingsDrawer = () => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const { isSettingsDrawerOpen, settingsView } = useSelector(selectNavbar);
  return (
    <Drawer type={DrawerType.Settings} header={<div>{t('settings.title')}</div>}>
      {isSettingsDrawerOpen && settingsView === 'body' && <SettingsBody />}
      {isSettingsDrawerOpen && settingsView === 'translation' && (
        <SettingsTranslation onBack={() => dispatch(setSettingsView(SettingsView.Body))} />
      )}
      {isSettingsDrawerOpen && settingsView === 'reciter' && (
        <SettingsReciter onBack={() => dispatch(setSettingsView(SettingsView.Body))} />
      )}
    </Drawer>
  );
};

export default SettingsDrawer;

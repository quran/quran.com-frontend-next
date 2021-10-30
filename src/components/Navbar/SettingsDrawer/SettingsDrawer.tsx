/* eslint-disable react/no-multi-comp */
import React, { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';

import Spinner from 'src/components/dls/Spinner/Spinner';
import Drawer, { DrawerType } from 'src/components/Navbar/Drawer';
import { selectNavbar } from 'src/redux/slices/navbar';

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

enum SettingsView {
  Body = 'body',
  Translation = 'translation',
  Reciter = 'reciter',
}

const SettingsDrawer = () => {
  const { t } = useTranslation('common');
  const { isSettingsDrawerOpen } = useSelector(selectNavbar);
  const [view, setView] = useState<SettingsView>(SettingsView.Body);
  return (
    <Drawer type={DrawerType.Settings} header={<div>{t('settings.title')}</div>}>
      {isSettingsDrawerOpen && view === 'body' && (
        <SettingsBody
          onChooseReciter={() => setView(SettingsView.Reciter)}
          onChooseTranslation={() => setView(SettingsView.Translation)}
        />
      )}
      {isSettingsDrawerOpen && view === 'translation' && (
        <SettingsTranslation onBack={() => setView(SettingsView.Body)} />
      )}
      {isSettingsDrawerOpen && view === 'reciter' && (
        <SettingsReciter
          onBack={() => {
            setView(SettingsView.Body);
          }}
        />
      )}
    </Drawer>
  );
};

export default SettingsDrawer;

/* eslint-disable react/no-multi-comp */
import React, { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';

import SettingsReciter from './SettingsReciter';
import SettingsTranslation from './SettingsTranslation';

import Spinner from 'src/components/dls/Spinner/Spinner';
import Drawer, { DrawerType } from 'src/components/Navbar/Drawer';
import { selectNavbar } from 'src/redux/slices/navbar';

const SettingsBody = dynamic(() => import('./SettingsBody'), {
  ssr: false,
  loading: () => <Spinner />,
});

type SettingView = 'setting-body' | 'setting-translation' | 'setting-reciter';

const SettingsDrawer = () => {
  const { t } = useTranslation('common');
  const { isSettingsDrawerOpen } = useSelector(selectNavbar);
  const [view, setView] = useState<SettingView>('setting-body');
  return (
    <Drawer type={DrawerType.Settings} header={<div>{t('settings.title')}</div>}>
      {isSettingsDrawerOpen && view === 'setting-body' && (
        <SettingsBody
          onTranslationClicked={() => setView('setting-translation')}
          onReciterClicked={() => setView('setting-reciter')}
        />
      )}
      {isSettingsDrawerOpen && view === 'setting-translation' && (
        <SettingsTranslation onBack={() => setView('setting-body')} />
      )}
      {isSettingsDrawerOpen && view === 'setting-reciter' && (
        <SettingsReciter
          onBack={() => {
            setView('setting-body');
          }}
        />
      )}
    </Drawer>
  );
};

export default SettingsDrawer;

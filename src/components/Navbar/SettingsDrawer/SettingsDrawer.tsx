/* eslint-disable react/no-multi-comp */
import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import dynamic from 'next/dynamic';
import { useDispatch, useSelector } from 'react-redux';

import BackIcon from '../../../../public/icons/west.svg';

import styles from './SettingsDrawer.module.scss';

import Button, { ButtonVariant } from 'src/components/dls/Button/Button';
import Spinner from 'src/components/dls/Spinner/Spinner';
import Drawer, { DrawerType } from 'src/components/Navbar/Drawer';
import { selectNavbar, setSettingsView, SettingsView } from 'src/redux/slices/navbar';

const SettingsBody = dynamic(() => import('./SettingsBody'), {
  ssr: false,
  loading: () => <Spinner />,
});

const ReciterSelectionBody = dynamic(() => import('./ReciterSelectionBody'), {
  ssr: false,
});

const TranslationSelectionBody = dynamic(() => import('./TranslationSelectionBody'), {
  ssr: false,
});

const TafisrSelectionBody = dynamic(() => import('./TafsirSelectionBody'), {
  ssr: false,
});

const SettingsDrawer = () => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const { isSettingsDrawerOpen, settingsView } = useSelector(selectNavbar);
  let header;
  if (settingsView === SettingsView.Body) header = <div>{t('settings.title')}</div>;
  if (settingsView !== SettingsView.Body)
    header = (
      <div className={styles.headerContainer}>
        <Button
          variant={ButtonVariant.Ghost}
          onClick={() => dispatch(setSettingsView(SettingsView.Body))}
        >
          <BackIcon />
        </Button>
        {settingsView === SettingsView.Translation && t('translations')}
        {settingsView === SettingsView.Reciter && t('reciter')}
        {settingsView === SettingsView.Tafsir && t('tafsir.title')}
      </div>
    );

  return (
    <Drawer type={DrawerType.Settings} header={header}>
      {isSettingsDrawerOpen && settingsView === SettingsView.Body && <SettingsBody />}
      {isSettingsDrawerOpen && settingsView === SettingsView.Translation && (
        <TranslationSelectionBody />
      )}
      {isSettingsDrawerOpen && settingsView === SettingsView.Reciter && <ReciterSelectionBody />}
      {isSettingsDrawerOpen && settingsView === SettingsView.Tafsir && <TafisrSelectionBody />}
    </Drawer>
  );
};

export default SettingsDrawer;

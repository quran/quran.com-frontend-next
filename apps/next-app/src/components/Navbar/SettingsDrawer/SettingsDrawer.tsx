/* eslint-disable react/no-multi-comp */
import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import dynamic from 'next/dynamic';
import { useDispatch, useSelector } from 'react-redux';

import BackIcon from '../../../../public/icons/west.svg';

import SettingsBodySkeleton from './SettingsBodySkeleton';
import styles from './SettingsDrawer.module.scss';

import Button, { ButtonVariant } from 'src/components/dls/Button/Button';
import Drawer, { DrawerType } from 'src/components/Navbar/Drawer';
import { selectNavbar, setSettingsView, SettingsView } from 'src/redux/slices/navbar';
import { logValueChange } from 'src/utils/eventLogger';

const SettingsBody = dynamic(() => import('./SettingsBody'), {
  ssr: false,
  loading: () => <SettingsBodySkeleton />,
});

const ReciterSelectionBody = dynamic(() => import('./ReciterSelectionBody'), {
  ssr: false,
});

const TranslationSelectionBody = dynamic(() => import('./TranslationSelectionBody'), {
  ssr: false,
});

const TafsirSelectionBody = dynamic(() => import('./TafsirSelectionBody'), {
  ssr: false,
});

const RepeatSettings = dynamic(() => import('./RepeatSettings'), {
  ssr: false,
});

const SettingsDrawer = () => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const { isSettingsDrawerOpen, settingsView } = useSelector(selectNavbar);

  const onGoBackClicked = () => {
    dispatch(setSettingsView(SettingsView.Body));
    logValueChange('settings_view', SettingsView.Body, settingsView);
  };
  let header;
  if (settingsView === SettingsView.Body) header = <div>{t('settings.title')}</div>;
  if (settingsView !== SettingsView.Body)
    header = (
      <div className={styles.headerContainer}>
        <Button variant={ButtonVariant.Ghost} onClick={onGoBackClicked}>
          <BackIcon />
        </Button>
        {settingsView === SettingsView.Translation && t('translations')}
        {settingsView === SettingsView.Reciter && t('reciter')}
        {settingsView === SettingsView.Tafsir && t('tafsir.title')}
        {settingsView === SettingsView.RepeatSettings && t('audio.player.repeat-settings')}
      </div>
    );

  return (
    <Drawer type={DrawerType.Settings} header={header} closeOnNavigation={false}>
      {isSettingsDrawerOpen && settingsView === SettingsView.Body && <SettingsBody />}
      {isSettingsDrawerOpen && settingsView === SettingsView.Translation && (
        <TranslationSelectionBody />
      )}
      {isSettingsDrawerOpen && settingsView === SettingsView.Reciter && <ReciterSelectionBody />}
      {isSettingsDrawerOpen && settingsView === SettingsView.Tafsir && <TafsirSelectionBody />}
      {isSettingsDrawerOpen && settingsView === SettingsView.RepeatSettings && <RepeatSettings />}
    </Drawer>
  );
};

export default SettingsDrawer;

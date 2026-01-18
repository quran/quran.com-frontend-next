/* eslint-disable react/no-multi-comp */
import React from 'react';

import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import drawerStyles from '../Drawer/Drawer.module.scss';

import SettingsBodySkeleton from './SettingsBodySkeleton';
import styles from './SettingsDrawer.module.scss';

import Drawer, { DrawerType } from '@/components/Navbar/Drawer';
import { useOnboarding } from '@/components/Onboarding/OnboardingProvider';
import Button, { ButtonVariant } from '@/dls/Button/Button';
import BackIcon from '@/icons/west.svg';
import { selectNavbar, setSettingsView, SettingsView } from '@/redux/slices/navbar';
import { logValueChange } from '@/utils/eventLogger';

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

const SettingsDrawer = () => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const { isSettingsDrawerOpen, settingsView } = useSelector(selectNavbar);
  const { isActive } = useOnboarding();

  const onGoBackClicked = () => {
    dispatch(setSettingsView(SettingsView.Body));
    logValueChange('settings_view', SettingsView.Body, settingsView);
  };

  let header;
  if (settingsView === SettingsView.Body) header = <> </>;
  if (settingsView !== SettingsView.Body) {
    header = (
      <div className={styles.headerContainer}>
        <Button variant={ButtonVariant.Ghost} onClick={onGoBackClicked}>
          <BackIcon />
        </Button>
        {settingsView === SettingsView.Translation && t('translations')}
        {settingsView === SettingsView.Reciter && t('reciter')}
        {settingsView === SettingsView.Tafsir && t('tafsir.title')}
      </div>
    );
  }

  const isTranslationView = settingsView === SettingsView.Translation;
  const isReciterView = settingsView === SettingsView.Reciter;

  const getDrawerClassName = () => {
    if (isTranslationView) return drawerStyles.translationView;
    if (isReciterView) return drawerStyles.reciterView;
    return undefined;
  };

  return (
    <Drawer
      id="settings-drawer"
      data-testid="settings-drawer"
      type={DrawerType.Settings}
      header={header}
      closeOnNavigation={false}
      canCloseDrawer={!isActive}
      bodyId="settings-drawer-body"
      removeHeaderWrapper={settingsView === SettingsView.Body}
      hideCloseButton={settingsView === SettingsView.Body}
      removeBodySpacing={settingsView === SettingsView.Body}
      className={getDrawerClassName()}
    >
      {isSettingsDrawerOpen && (
        <div data-testid="settings-drawer-body">
          {settingsView === SettingsView.Body && <SettingsBody />}
          {settingsView === SettingsView.Translation && <TranslationSelectionBody />}
          {settingsView === SettingsView.Reciter && <ReciterSelectionBody />}
          {settingsView === SettingsView.Tafsir && <TafsirSelectionBody />}
        </div>
      )}
    </Drawer>
  );
};

export default SettingsDrawer;

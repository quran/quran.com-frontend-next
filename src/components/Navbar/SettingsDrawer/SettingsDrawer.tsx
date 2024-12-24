/* eslint-disable react/no-multi-comp */
import React from 'react';

import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

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
  if (settingsView === SettingsView.Body) header = <div>{t('settings.title')}</div>;
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

  return (
    <Drawer
      type={DrawerType.Settings}
      header={header}
      closeOnNavigation={false}
      canCloseDrawer={!isActive}
      bodyId="settings-drawer-body"
    >
      {isSettingsDrawerOpen && settingsView === SettingsView.Body && <SettingsBody />}
      {isSettingsDrawerOpen && settingsView === SettingsView.Translation && (
        <TranslationSelectionBody />
      )}
      {isSettingsDrawerOpen && settingsView === SettingsView.Reciter && <ReciterSelectionBody />}
      {isSettingsDrawerOpen && settingsView === SettingsView.Tafsir && <TafsirSelectionBody />}
    </Drawer>
  );
};

export default SettingsDrawer;

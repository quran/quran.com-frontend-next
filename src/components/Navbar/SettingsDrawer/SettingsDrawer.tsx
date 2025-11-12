/* eslint-disable react/no-multi-comp */
import React, { useState } from 'react';

import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import { SettingsTab } from './SettingsBody';
import SettingsBodySkeleton from './SettingsBodySkeleton';
import styles from './SettingsDrawer.module.scss';
import settingsTabsStyles from './SettingsTabs.module.scss';

import Drawer, { DrawerType } from '@/components/Navbar/Drawer';
import { useOnboarding } from '@/components/Onboarding/OnboardingProvider';
import Button, { ButtonVariant } from '@/dls/Button/Button';
import Tabs from '@/dls/Tabs/Tabs';
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
  const [selectedTab, setSelectedTab] = useState<SettingsTab>(SettingsTab.Arabic);

  const onGoBackClicked = () => {
    dispatch(setSettingsView(SettingsView.Body));
    logValueChange('settings_view', SettingsView.Body, settingsView);
  };

  const tabs = [
    { title: t('settings.arabic'), value: SettingsTab.Arabic },
    { title: t('translation'), value: SettingsTab.Translation },
    { title: t('settings.more'), value: SettingsTab.More },
  ];

  let header;
  if (settingsView === SettingsView.Body) {
    header = (
      <Tabs
        tabs={tabs}
        selected={selectedTab}
        className={settingsTabsStyles.tabItem}
        selectedClassName={settingsTabsStyles.tabItemSelected}
        containerClassName={settingsTabsStyles.container}
        onSelect={(value) => setSelectedTab(value as SettingsTab)}
      />
    );
  }
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
      hideCloseButton={settingsView === SettingsView.Body}
      bodyId="settings-drawer-body"
    >
      {isSettingsDrawerOpen && settingsView === SettingsView.Body && (
        <SettingsBody selectedTab={selectedTab} />
      )}
      {isSettingsDrawerOpen && settingsView === SettingsView.Translation && (
        <TranslationSelectionBody />
      )}
      {isSettingsDrawerOpen && settingsView === SettingsView.Reciter && <ReciterSelectionBody />}
      {isSettingsDrawerOpen && settingsView === SettingsView.Tafsir && <TafsirSelectionBody />}
    </Drawer>
  );
};

export default SettingsDrawer;

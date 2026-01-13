import React, { useEffect, useState, useMemo } from 'react';

import { useSelector } from 'react-redux';

import DoneButton from './DoneButton';
import ResetButton from './ResetButton';
import styles from './SettingsBody.module.scss';
import SettingTabs, { SettingTab } from './SettingTabs';

import { useOnboarding } from '@/components/Onboarding/OnboardingProvider';
import { selectNavbar, SettingsView } from '@/redux/slices/navbar';

const SettingsBody = () => {
  const { isActive, nextStep, activeStepIndex } = useOnboarding();
  const { lastSettingsView } = useSelector(selectNavbar);

  // Map the last settings view to the corresponding tab
  const getTabFromSettingsView = (view: SettingsView): SettingTab => {
    switch (view) {
      case SettingsView.Translation:
        return SettingTab.Translation;
      case SettingsView.Tafsir:
        return SettingTab.More;
      case SettingsView.Reciter:
      case SettingsView.Body:
      default:
        return SettingTab.Arabic;
    }
  };

  // Initialize with the tab corresponding to the last visited view
  const initialTab = useMemo(() => getTabFromSettingsView(lastSettingsView), [lastSettingsView]);
  const [activeTab, setActiveTab] = useState<SettingTab>(initialTab);

  useEffect(() => {
    let timeout: NodeJS.Timeout = null;

    // wait for transition to finish (.4s)
    if (isActive && activeStepIndex === 0) timeout = setTimeout(() => nextStep(), 400);

    return () => {
      if (timeout !== null) clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStepIndex, isActive]);

  // Update active tab when returning from a sub-view
  useEffect(() => {
    const targetTab = getTabFromSettingsView(lastSettingsView);
    setActiveTab(targetTab);
  }, [lastSettingsView]);

  return (
    <div className={styles.container}>
      <SettingTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className={styles.buttonsContainer}>
        <ResetButton />
        <DoneButton />
      </div>
    </div>
  );
};

export default SettingsBody;

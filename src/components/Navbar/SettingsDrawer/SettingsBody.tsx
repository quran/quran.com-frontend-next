import React, { useEffect } from 'react';

import DoneButton from './DoneButton';
import ResetButton from './ResetButton';
import styles from './SettingsBody.module.scss';
import SettingTabs from './SettingTabs';

import { useOnboarding } from '@/components/Onboarding/OnboardingProvider';

const SettingsBody = () => {
  const { isActive, nextStep, activeStepIndex } = useOnboarding();

  useEffect(() => {
    let timeout: NodeJS.Timeout = null;

    // wait for transition to finish (.4s)
    if (isActive && activeStepIndex === 0) timeout = setTimeout(() => nextStep(), 400);

    return () => {
      if (timeout !== null) clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStepIndex, isActive]);

  return (
    <div className={styles.container}>
      <SettingTabs />
      <div className={styles.buttonsContainer}>
        <ResetButton />
        <DoneButton />
      </div>
    </div>
  );
};

export default SettingsBody;

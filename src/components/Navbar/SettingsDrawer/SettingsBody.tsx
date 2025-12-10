import React, { useEffect } from 'react';

import ResetButton from './ResetButton';
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
    <>
      <SettingTabs />
      <ResetButton />
    </>
  );
};

export default SettingsBody;

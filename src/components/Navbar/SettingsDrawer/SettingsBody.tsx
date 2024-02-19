import React, { useEffect } from 'react';

import QuranFontSection from './QuranFontSection';
import ResetButton from './ResetButton';
import ThemeSection from './ThemeSection';
import TranslationSection from './TranslationSection';
import WordByWordSection from './WordByWordSection';

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
      <ThemeSection />
      <QuranFontSection />
      <WordByWordSection />
      <TranslationSection />
      <ResetButton />
    </>
  );
};

export default SettingsBody;

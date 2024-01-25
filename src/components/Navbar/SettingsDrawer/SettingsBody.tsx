import React, { useEffect } from 'react';

import QuranFontSection from './QuranFontSection';
import ResetButton from './ResetButton';
import ThemeSection from './ThemeSection';
import TranslationSection from './TranslationSection';
import WordByWordSection from './WordByWordSection';

import { useOnboarding } from '@/components/Onboarding/OnboardingProvider';

const SettingsBody = () => {
  const { isActive, nextStep } = useOnboarding();

  useEffect(() => {
    if (isActive) setTimeout(() => nextStep(), 400); // wait for transition to finish (.4s)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

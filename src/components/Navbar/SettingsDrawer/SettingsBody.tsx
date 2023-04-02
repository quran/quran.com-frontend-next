import React from 'react';

import QuranFontSection from './QuranFontSection';
import ResetButton from './ResetButton';
import ThemeSection from './ThemeSection';
import TranslationSection from './TranslationSection';
import WordByWordSection from './WordByWordSection';

const SettingsBody = () => (
  <>
    <ThemeSection />
    <QuranFontSection />
    <WordByWordSection />
    <TranslationSection />
    <ResetButton />
  </>
);

export default SettingsBody;

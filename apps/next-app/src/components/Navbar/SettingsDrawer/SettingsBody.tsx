import React from 'react';

import AudioSection from './AudioSection';
import QuranFontSection from './QuranFontSection';
import ResetButton from './ResetButton';
import ThemeSection from './ThemeSection';
import TranslationSection from './TranslationSection';
import WordByWordSection from './WordByWordSection';
import WordTooltipSection from './WordTooltipSection';

const SettingsBody = () => (
  <>
    <ThemeSection />
    <QuranFontSection />
    <WordByWordSection />
    <WordTooltipSection />
    <TranslationSection />
    <AudioSection />
    <ResetButton />
  </>
);

export default SettingsBody;

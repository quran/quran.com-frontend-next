import React from 'react';

import AudioSection from './AudioSection';
import QuranFontSection from './QuranFontSection';
import ReadingExperienceSection from './ReadingExperienceSection';
import ResetButton from './ResetButton';
import TafsirSection from './TafsirSection';
import ThemeSection from './ThemeSection';
import TranslationSection from './TranslationSection';

const SettingsBody = ({ onChooseTranslation, onChooseReciter }) => (
  <>
    <ThemeSection />
    <ReadingExperienceSection />
    <QuranFontSection />
    <TranslationSection onChooseTranslation={onChooseTranslation} />
    <TafsirSection />
    <AudioSection onChooseReciter={onChooseReciter} />
    <ResetButton />
  </>
);

export default SettingsBody;

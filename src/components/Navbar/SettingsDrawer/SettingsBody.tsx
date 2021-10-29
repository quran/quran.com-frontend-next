import React from 'react';

import AudioSection from './AudioSection';
import QuranFontSection from './QuranFontSection';
import ReadingExperienceSection from './ReadingExperienceSection';
import ResetButton from './ResetButton';
import TafsirSection from './TafsirSection';
import ThemeSection from './ThemeSection';

import Button from 'src/components/dls/Button/Button';
// import TranslationSection from './TranslationSection';

const SettingsBody = ({ onTranslationClicked, onReciterClicked }) => (
  <>
    <Button onClick={onTranslationClicked}>Choose Translation</Button>
    <Button onClick={onReciterClicked}>Choose Reciter</Button>
    <ThemeSection />
    <ReadingExperienceSection />
    <QuranFontSection />
    {/* <TranslationSection /> */}
    <TafsirSection />
    <AudioSection />
    <ResetButton />
  </>
);

export default SettingsBody;

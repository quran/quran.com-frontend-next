import React from 'react';
import AudioSection from './AudioSection';
import QuranFontSection from './QuranFontSection';

import ReadingExperienceSection from './ReadingExperienceSection';
import ResetButton from './ResetButton';
import styles from './SettingsBody.module.scss';
import TafsirSection from './TafsirSection';
import ThemeSection from './ThemeSection';
import TranslationSection from './TranslationSection';

const SettingsBody = () => (
  <div className={styles.container}>
    <ThemeSection />
    <ReadingExperienceSection />
    <QuranFontSection />
    <TranslationSection />
    <TafsirSection />
    <AudioSection />
    <ResetButton />
  </div>
);

export default SettingsBody;

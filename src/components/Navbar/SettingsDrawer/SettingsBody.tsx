import React from 'react';
import Button from 'src/components/dls/Button/Button';
import AudioSection from './AudioSection';
import QuranFontSection from './QuranFontSection';

import ReadingExperienceSection from './ReadingExperienceSection';
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
    <Button>Reset settings</Button>
  </div>
);

export default SettingsBody;

import React from 'react';
import Button from 'src/components/dls/Button/Button';
import QuranFontSection from './QuranFontSection';

import ReadingExperienceSection from './ReadingExperienceSection';
import { Section, SectionTitle } from './Section';
import styles from './SettingsBody.module.scss';
import ThemeSection from './ThemeSection';
import TranslationSection from './TranslationSection';

const SettingsBody = () => (
  <div className={styles.container}>
    <ThemeSection />
    <ReadingExperienceSection />
    <QuranFontSection />
    <TranslationSection />

    <Section>
      <SectionTitle>Tafsir</SectionTitle>
      <div>
        <div>translation</div>
        <div>aak</div>
      </div>
      <div>
        <div>font size</div>
        <div>-3=</div>
      </div>
    </Section>

    <Section>
      <SectionTitle>Audio</SectionTitle>
      <div>
        <div>Reciter</div>
        <div>==</div>
      </div>
    </Section>

    <div>
      <Button>Reset settings</Button>
    </div>
  </div>
);

export default SettingsBody;

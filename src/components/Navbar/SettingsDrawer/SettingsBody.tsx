import React from 'react';

import AudioSection from './AudioSection';
import PrayerTimesSection from './PrayerTimesSection';
import QuranFontSection from './QuranFontSection';
import ReadingExperienceSection from './ReadingExperienceSection';
import ResetButton from './ResetButton';
import TafsirSection from './TafsirSection';
import ThemeSection from './ThemeSection';
import TranslationSection from './TranslationSection';

const SettingsBody = () => (
  <>
    <ThemeSection />
    <ReadingExperienceSection />
    <QuranFontSection />
    <TranslationSection />
    <TafsirSection />
    <AudioSection />
    <PrayerTimesSection />
    <ResetButton />
  </>
);

export default SettingsBody;

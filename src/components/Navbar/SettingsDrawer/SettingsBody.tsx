import React from 'react';

import AudioSection from './AudioSection';
import PrayerTimesSection from './PrayerTimesSection';
import QuranFontSection from './QuranFontSection';
import ResetButton from './ResetButton';
import TafsirSection from './TafsirSection';
import ThemeSection from './ThemeSection';
import TranslationSection from './TranslationSection';
import WordByWordSection from './WordByWordSection';
import WordTooltipSection from './WordTooltipSection.module.scss';

const SettingsBody = () => (
  <>
    <ThemeSection />
    <WordByWordSection />
    <WordTooltipSection />
    <QuranFontSection />
    <TranslationSection />
    <TafsirSection />
    <AudioSection />
    <PrayerTimesSection />
    <ResetButton />
  </>
);

export default SettingsBody;

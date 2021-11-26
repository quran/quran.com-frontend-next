import React from 'react';

import AudioSection from './AudioSection';
import PrayerTimesSection from './PrayerTimesSection';
import QuranFontSection from './QuranFontSection';
import ResetButton from './ResetButton';
import TafsirSection from './TafsirSection';
import ThemeSection from './ThemeSection';
import TranslationSection from './TranslationSection';
import WordByWordSection from './WordByWordSection';
import WordTooltipSection from './WordTooltipSection';

const SettingsBody = () => (
  <>
    <ThemeSection />
    <QuranFontSection />
    <TranslationSection />
    <TafsirSection />
    <WordByWordSection />
    <WordTooltipSection />
    <AudioSection />
    <PrayerTimesSection />
    <ResetButton />
  </>
);

export default SettingsBody;

import React from 'react';

import * as Tabs from '@radix-ui/react-tabs';

import QuranFontSection from './QuranFontSection';
import styles from './SettingTabs.module.scss';
import TranslationSection from './TranslationSection';
import VersePreview from './VersePreview';
import WordByWordSection from './WordByWordSection';

export enum SettingTab {
  Arabic = 'arabic',
  Translation = 'translation',
  More = 'more',
}

const tabs = [
  { id: SettingTab.Arabic, label: 'Arabic' },
  { id: SettingTab.Translation, label: 'Translation' },
  { id: SettingTab.More, label: 'More' },
];

const SettingTabs = () => {
  return (
    <Tabs.Root className={styles.root} defaultValue={SettingTab.Arabic}>
      <Tabs.List className={styles.list} aria-label="Settings tabs">
        {tabs.map((tab) => (
          <Tabs.Trigger className={styles.trigger} key={tab.id} value={tab.id}>
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      <div className={styles.versePreviewContainer}>
        <VersePreview />
      </div>
      {tabs.map((tab) => (
        <Tabs.Content className={styles.content} key={tab.id} value={tab.id}>
          {tab.id === SettingTab.Arabic && <QuranFontSection />}
          {tab.id === SettingTab.Translation && <TranslationSection />}
          {tab.id === SettingTab.More && <WordByWordSection />}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
};

export default SettingTabs;

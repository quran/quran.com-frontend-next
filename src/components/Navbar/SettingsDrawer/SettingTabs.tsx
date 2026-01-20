import React from 'react';

import * as Tabs from '@radix-ui/react-tabs';
import useTranslation from 'next-translate/useTranslation';

import QuranFontSection from './QuranFontSection';
import styles from './SettingTabs.module.scss';
import TranslationSection from './TranslationSection';
import VersePreview from './VersePreview';
import WordByWordSection from './WordByWordSection';

import { SettingsTab } from '@/redux/slices/navbar';

type SettingTabsProps = {
  activeTab?: SettingsTab;
  onTabChange?: (tab: SettingsTab, shouldLog?: boolean) => void;
};

const SettingTabs = ({ activeTab = SettingsTab.Arabic, onTabChange }: SettingTabsProps) => {
  const { t } = useTranslation('common');

  const tabs = [
    { id: SettingsTab.Arabic, label: t('quran-reader:arabic') },
    { id: SettingsTab.Translation, label: t('translation') },
    { id: SettingsTab.More, label: t('more') },
  ];

  return (
    <Tabs.Root
      className={styles.root}
      value={activeTab}
      onValueChange={(value) => onTabChange?.(value as SettingsTab)}
    >
      <Tabs.List className={styles.list} aria-label="Settings tabs">
        {tabs.map((tab) => (
          <Tabs.Trigger className={styles.trigger} key={tab.id} value={tab.id} data-testid={tab.id}>
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      <div className={styles.scrollableArea}>
        <div className={styles.versePreviewContainer}>
          <VersePreview />
        </div>
        {tabs.map((tab) => (
          <Tabs.Content className={styles.content} key={tab.id} value={tab.id}>
            {tab.id === SettingsTab.Arabic && <QuranFontSection />}
            {tab.id === SettingsTab.Translation && <TranslationSection />}
            {tab.id === SettingsTab.More && <WordByWordSection />}
          </Tabs.Content>
        ))}
      </div>
    </Tabs.Root>
  );
};

export default SettingTabs;

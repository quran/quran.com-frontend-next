import React, { useEffect } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import QuranFontSection from './QuranFontSection';
import ResetButton from './ResetButton';
import styles from './SettingsBody.module.scss';
import TranslationSection from './TranslationSection';
import VersePreview from './VersePreview';
import WordByWordSection from './WordByWordSection';

import { useOnboarding } from '@/components/Onboarding/OnboardingProvider';
import Button from '@/dls/Button/Button';
import { setIsSettingsDrawerOpen } from '@/redux/slices/navbar';
import { logButtonClick } from '@/utils/eventLogger';

export enum SettingsTab {
  Arabic = 'arabic',
  Translation = 'translation',
  More = 'more',
}

interface SettingsBodyProps {
  selectedTab: SettingsTab;
}

const SettingsBody = ({ selectedTab }: SettingsBodyProps) => {
  const { isActive, nextStep, activeStepIndex } = useOnboarding();
  const { t } = useTranslation('common');
  const dispatch = useDispatch();

  useEffect(() => {
    let timeout: NodeJS.Timeout = null;

    // wait for transition to finish (.4s)
    if (isActive && activeStepIndex === 0) timeout = setTimeout(() => nextStep(), 400);

    return () => {
      if (timeout !== null) clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStepIndex, isActive]);

  const onDoneClicked = () => {
    logButtonClick('settings_done');
    dispatch(setIsSettingsDrawerOpen(false));
  };

  return (
    <>
      <div className={styles.versePreviewContainer}>
        <VersePreview />
      </div>
      {selectedTab === SettingsTab.Arabic && <QuranFontSection />}
      {selectedTab === SettingsTab.Translation && <TranslationSection />}
      {selectedTab === SettingsTab.More && <WordByWordSection />}
      <div className={styles.buttonsContainer}>
        <ResetButton />
        <Button onClick={onDoneClicked}>{t('done')}</Button>
      </div>
    </>
  );
};

export default SettingsBody;

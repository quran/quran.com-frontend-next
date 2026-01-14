import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import styles from '../styles/EmptyTranslationMessage.module.scss';

import { setIsSettingsDrawerOpen, setSettingsView, SettingsView } from '@/redux/slices/navbar';
import { selectReadingPreference } from '@/redux/slices/QuranReader/readingPreferences';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import { logButtonClick } from '@/utils/eventLogger';
import { ReadingPreference } from 'types/QuranReader';

const EmptyTranslationMessage: React.FC = () => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const readingPreference = useSelector(selectReadingPreference);
  const selectedTranslations = useSelector(selectSelectedTranslations);

  const isTranslationMode = readingPreference === ReadingPreference.ReadingTranslation;
  const hasTranslations = selectedTranslations && selectedTranslations.length > 0;

  // Only show when in ReadingTranslation mode with no translations selected
  if (!isTranslationMode || hasTranslations) {
    return null;
  }

  const handleSelectTranslation = () => {
    logButtonClick('empty_translation_select_button');
    dispatch(setSettingsView(SettingsView.Translation));
    dispatch(setIsSettingsDrawerOpen(true));
  };

  return (
    <div className={styles.container}>
      <p className={styles.message}>{t('reading-preference.select-translation-message')}</p>
      <button type="button" className={styles.button} onClick={handleSelectTranslation}>
        {t('reading-preference.select-translation')}
      </button>
    </div>
  );
};

export default EmptyTranslationMessage;

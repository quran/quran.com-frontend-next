import React, { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from './ReadingModeActions.module.scss';
import TranslationModeButton from './TranslationModeButton';

import DataFetcher from '@/components/DataFetcher';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import useReadingPreferenceSwitcher, {
  SwitcherContext,
} from '@/hooks/useReadingPreferenceSwitcher';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import { makeTranslationsUrl } from '@/utils/apiPaths';
import { logValueChange } from '@/utils/eventLogger';
import { TranslationsResponse } from 'types/ApiResponses';
import { ReadingPreference } from 'types/QuranReader';

const ReadingModeActions: React.FC = () => {
  const { t, lang } = useTranslation('common');
  const { readingPreference, switchReadingPreference } = useReadingPreferenceSwitcher({
    context: SwitcherContext.ContextMenu,
  });
  const selectedTranslations = useSelector(selectSelectedTranslations);

  const hasTranslations = selectedTranslations && selectedTranslations.length > 0;
  const isArabicSelected = readingPreference === ReadingPreference.Reading;
  const isTranslationSelected = readingPreference === ReadingPreference.ReadingTranslation;

  const handleArabicClick = useCallback(() => {
    if (isArabicSelected) return;
    logValueChange('chapter_header_reading_mode', readingPreference, ReadingPreference.Reading);
    switchReadingPreference(ReadingPreference.Reading);
  }, [isArabicSelected, readingPreference, switchReadingPreference]);

  const renderTranslationButton = useCallback(
    (data: TranslationsResponse) => (
      <TranslationModeButton
        isTranslationSelected={isTranslationSelected}
        readingPreference={readingPreference}
        switchReadingPreference={switchReadingPreference}
        translations={data?.translations || []}
        selectedTranslations={selectedTranslations}
        hasTranslations={hasTranslations}
      />
    ),
    [
      isTranslationSelected,
      readingPreference,
      switchReadingPreference,
      selectedTranslations,
      hasTranslations,
    ],
  );

  const translationButtonLoading = useCallback(
    () => (
      <Button
        size={ButtonSize.XSmall}
        shape={ButtonShape.Pill}
        variant={ButtonVariant.ModeToggle}
        isSelected={isTranslationSelected}
      >
        {t('translation')}
      </Button>
    ),
    [isTranslationSelected, t],
  );

  return (
    <div className={styles.container}>
      <Button
        size={ButtonSize.XSmall}
        shape={ButtonShape.Pill}
        variant={ButtonVariant.ModeToggle}
        isSelected={isArabicSelected}
        onClick={handleArabicClick}
      >
        {t('reading-preference.arabic')}
      </Button>

      <DataFetcher
        queryKey={makeTranslationsUrl(lang)}
        render={renderTranslationButton}
        loading={translationButtonLoading}
      />
    </div>
  );
};

export default ReadingModeActions;

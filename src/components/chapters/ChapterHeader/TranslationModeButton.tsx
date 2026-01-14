import React, { useCallback, useRef, useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import styles from './ReadingModeActions.module.scss';

import TranslationDropdown from '@/components/QuranReader/ContextMenu/components/TranslationDropdown';
import ChevronDownIcon from '@/public/icons/chevron-down.svg';
import { setIsSettingsDrawerOpen, setSettingsView, SettingsView } from '@/redux/slices/navbar';
import { selectSelectedReadingTranslation } from '@/redux/slices/QuranReader/readingPreferences';
import { logButtonClick, logValueChange } from '@/utils/eventLogger';
import AvailableTranslation from 'types/AvailableTranslation';
import { ReadingPreference } from 'types/QuranReader';

interface TranslationModeButtonProps {
  isTranslationSelected: boolean;
  readingPreference: ReadingPreference;
  switchReadingPreference: (preference: ReadingPreference) => void;
  translations: AvailableTranslation[];
  selectedTranslations: number[];
  hasTranslations: boolean;
}

const TranslationModeButton: React.FC<TranslationModeButtonProps> = ({
  isTranslationSelected,
  readingPreference,
  switchReadingPreference,
  translations,
  selectedTranslations,
  hasTranslations,
}) => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const selectedReadingTranslation = useSelector(selectSelectedReadingTranslation);

  const openTranslationSettings = useCallback(() => {
    logButtonClick('chapter_header_select_translation');
    dispatch(setSettingsView(SettingsView.Translation));
    dispatch(setIsSettingsDrawerOpen(true));
    setIsDropdownOpen(false);
  }, [dispatch]);

  const handleTranslationClick = useCallback(() => {
    if (!isTranslationSelected) {
      logValueChange(
        'chapter_header_reading_mode',
        readingPreference,
        ReadingPreference.ReadingTranslation,
      );
      switchReadingPreference(ReadingPreference.ReadingTranslation);
    } else {
      setIsDropdownOpen((prev) => !prev);
    }
  }, [isTranslationSelected, readingPreference, switchReadingPreference]);

  const handleNoTranslationsClick = useCallback(() => {
    if (!isTranslationSelected) {
      logValueChange(
        'chapter_header_reading_mode',
        readingPreference,
        ReadingPreference.ReadingTranslation,
      );
      switchReadingPreference(ReadingPreference.ReadingTranslation);
    }
  }, [isTranslationSelected, readingPreference, switchReadingPreference]);

  // When no translations selected, show "Translation: None selected" button
  if (!hasTranslations) {
    return (
      <button
        type="button"
        className={classNames(styles.modeButton, {
          [styles.modeButtonSelected]: isTranslationSelected,
          [styles.modeButtonUnselected]: !isTranslationSelected,
        })}
        onClick={handleNoTranslationsClick}
      >
        {t('translation')}: {t('reading-preference.none-selected')}
      </button>
    );
  }

  // Use selectedReadingTranslation if set, otherwise fall back to first in list
  const activeTranslationId = selectedReadingTranslation
    ? Number(selectedReadingTranslation)
    : selectedTranslations[0];

  const activeTranslation = translations?.find(
    (translation) => translation.id === activeTranslationId,
  );

  const displayText = isTranslationSelected
    ? `${t('translation')}: ${activeTranslation?.name || ''}`
    : t('translation');

  return (
    <div className={styles.translationButtonWrapper}>
      <button
        ref={triggerButtonRef}
        type="button"
        aria-expanded={isDropdownOpen}
        aria-haspopup="listbox"
        className={classNames(styles.modeButton, styles.translationButton, {
          [styles.modeButtonSelected]: isTranslationSelected,
          [styles.modeButtonUnselected]: !isTranslationSelected,
        })}
        onClick={handleTranslationClick}
      >
        <span className={styles.translationText}>{displayText}</span>
        {isTranslationSelected && (
          <ChevronDownIcon
            className={classNames(styles.dropdownIcon, {
              [styles.dropdownIconOpen]: isDropdownOpen,
            })}
          />
        )}
      </button>
      {isDropdownOpen && (
        <TranslationDropdown
          translations={translations || []}
          selectedTranslations={selectedTranslations}
          onClose={() => setIsDropdownOpen(false)}
          onOpenSettings={openTranslationSettings}
          triggerRef={triggerButtonRef}
        />
      )}
    </div>
  );
};

export default TranslationModeButton;

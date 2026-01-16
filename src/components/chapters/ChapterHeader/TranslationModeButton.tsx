import React, { useCallback, useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import styles from './ReadingModeActions.module.scss';

import PopoverMenu, { PopoverMenuAlign } from '@/components/dls/PopoverMenu/PopoverMenu';
import TranslationDropdownContent from '@/components/QuranReader/ContextMenu/components/TranslationDropdownContent';
import useCloseOnScroll from '@/hooks/useCloseOnScroll';
import useIsMobile from '@/hooks/useIsMobile';
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
  const selectedReadingTranslation = useSelector(selectSelectedReadingTranslation);
  const isMobile = useIsMobile();

  const openTranslationSettings = useCallback(() => {
    logButtonClick('chapter_header_select_translation');
    dispatch(setSettingsView(SettingsView.Translation));
    dispatch(setIsSettingsDrawerOpen(true));
    setIsDropdownOpen(false);
  }, [dispatch]);

  const switchToTranslationMode = useCallback(() => {
    logValueChange(
      'chapter_header_reading_mode',
      readingPreference,
      ReadingPreference.ReadingTranslation,
    );
    switchReadingPreference(ReadingPreference.ReadingTranslation);
  }, [readingPreference, switchReadingPreference]);

  const closeDropdown = useCallback(() => setIsDropdownOpen(false), []);
  useCloseOnScroll(isDropdownOpen, closeDropdown);

  const activeTranslationId = selectedReadingTranslation
    ? Number(selectedReadingTranslation)
    : selectedTranslations?.[0] ?? null;

  const activeTranslation = translations?.find((tr) => tr.id === activeTranslationId);

  // No translations selected
  if (!hasTranslations) {
    return (
      <button
        type="button"
        className={classNames(styles.modeButton, {
          [styles.modeButtonSelected]: isTranslationSelected,
          [styles.modeButtonUnselected]: !isTranslationSelected,
        })}
        onClick={switchToTranslationMode}
      >
        {t('translation')}: {t('reading-preference.none-selected')}
      </button>
    );
  }

  // Arabic mode: plain button (no PopoverMenu)
  if (!isTranslationSelected) {
    return (
      <button
        type="button"
        className={classNames(
          styles.modeButton,
          styles.translationButton,
          styles.modeButtonUnselected,
        )}
        onClick={switchToTranslationMode}
      >
        <span className={styles.translationText}>{t('translation')}</span>
      </button>
    );
  }

  // Translation mode: PopoverMenu with dropdown
  const displayText = `${t('translation')}: ${activeTranslation?.name || ''}`;

  return (
    <PopoverMenu
      trigger={
        <button
          type="button"
          aria-expanded={isDropdownOpen}
          aria-haspopup="listbox"
          className={classNames(
            styles.modeButton,
            styles.translationButton,
            styles.modeButtonSelected,
          )}
        >
          <span className={styles.translationText}>{displayText}</span>
          <ChevronDownIcon
            className={classNames(styles.dropdownIcon, {
              [styles.dropdownIconOpen]: isDropdownOpen,
            })}
          />
        </button>
      }
      isOpen={isDropdownOpen}
      isModal={false}
      onOpenChange={setIsDropdownOpen}
      contentClassName={styles.dropdownContent}
      align={isMobile ? PopoverMenuAlign.END : PopoverMenuAlign.START}
      sideOffset={8}
    >
      <TranslationDropdownContent
        translations={translations || []}
        selectedTranslations={selectedTranslations}
        onClose={closeDropdown}
        onOpenSettings={openTranslationSettings}
      />
    </PopoverMenu>
  );
};

export default TranslationModeButton;

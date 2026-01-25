import React, { useCallback, useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import styles from './ReadingModeActions.module.scss';

import PopoverMenu, { PopoverMenuAlign } from '@/components/dls/PopoverMenu/PopoverMenu';
import TranslationDropdownContent from '@/components/QuranReader/ContextMenu/components/TranslationDropdownContent';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import useCloseOnScroll from '@/hooks/useCloseOnScroll';
import useIsMobile from '@/hooks/useIsMobile';
import ChevronDownIcon from '@/public/icons/chevron-down.svg';
import { setIsSettingsDrawerOpen, setSettingsView, SettingsView } from '@/redux/slices/navbar';
import { selectValidatedReadingTranslation } from '@/redux/slices/QuranReader/readingPreferences';
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
  const selectedReadingTranslation = useSelector(selectValidatedReadingTranslation);
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

  const activeTranslation = translations?.find((tr) => tr.id === selectedReadingTranslation);

  // No translations selected
  if (!hasTranslations) {
    return (
      <Button
        size={ButtonSize.XSmall}
        shape={ButtonShape.Pill}
        variant={ButtonVariant.ModeToggle}
        isSelected={isTranslationSelected}
        onClick={switchToTranslationMode}
        className={styles.translationButton}
        contentClassName={styles.translationButtonContent}
      >
        <span className={styles.translationText}>
          {t('translation')}: {t('reading-preference.none-selected')}
        </span>
      </Button>
    );
  }

  // Arabic mode: plain button (no PopoverMenu)
  if (!isTranslationSelected) {
    return (
      <Button
        size={ButtonSize.XSmall}
        shape={ButtonShape.Pill}
        variant={ButtonVariant.ModeToggle}
        isSelected={false}
        onClick={switchToTranslationMode}
        className={styles.translationButton}
        contentClassName={styles.translationButtonContent}
      >
        <span className={styles.translationText}>{t('translation')}</span>
      </Button>
    );
  }

  // Translation mode: PopoverMenu with dropdown
  // Only show "Translation: Name" if we found the translation, otherwise just "Translation"
  const displayText = activeTranslation?.translatedName?.name
    ? `${t('translation')}: ${activeTranslation.translatedName.name}`
    : t('translation');

  return (
    <PopoverMenu
      trigger={
        <Button
          size={ButtonSize.XSmall}
          shape={ButtonShape.Pill}
          variant={ButtonVariant.ModeToggle}
          isSelected
          aria-expanded={isDropdownOpen}
          aria-haspopup="listbox"
          className={styles.translationButton}
          contentClassName={styles.translationButtonContent}
          suffix={
            <ChevronDownIcon
              className={classNames(styles.dropdownIcon, {
                [styles.dropdownIconOpen]: isDropdownOpen,
              })}
            />
          }
        >
          <span className={styles.translationText}>{displayText}</span>
        </Button>
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

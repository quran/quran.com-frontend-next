import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from '../styles/TranslationDropdown.module.scss';

import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import SettingsIcon from '@/public/icons/settings-stroke.svg';
import {
  selectValidatedReadingTranslation,
  setSelectedReadingTranslation,
} from '@/redux/slices/QuranReader/readingPreferences';
import { logValueChange } from '@/utils/eventLogger';
import PreferenceGroup from 'types/auth/PreferenceGroup';
import AvailableTranslation from 'types/AvailableTranslation';

interface TranslationDropdownContentProps {
  translations: AvailableTranslation[];
  selectedTranslations: number[];
  onClose: () => void;
  onOpenSettings: () => void;
}

/**
 * Content for the translation dropdown menu.
 * Used inside PopoverMenu which handles positioning and portal rendering.
 *
 * @returns {JSX.Element} The dropdown content component
 */
const TranslationDropdownContent: React.FC<TranslationDropdownContentProps> = ({
  translations,
  selectedTranslations,
  onClose,
  onOpenSettings,
}) => {
  const { t } = useTranslation('common');
  const {
    actions: { onSettingsChange },
  } = usePersistPreferenceGroup();
  const currentReadingTranslation = useSelector(selectValidatedReadingTranslation);

  // Filter to only show user's selected translations
  const availableTranslations = translations.filter((tr) => selectedTranslations.includes(tr.id));

  const handleTranslationSelect = (translationId: number) => {
    if (translationId === currentReadingTranslation) {
      onClose();
      return;
    }

    const translationIdStr = String(translationId);
    const previousValueStr = currentReadingTranslation ? String(currentReadingTranslation) : null;

    logValueChange('chapter_header_reading_translation', currentReadingTranslation, translationId);

    // Persist selectedReadingTranslation to the backend (PreferenceGroup.READING)
    // This only changes which translation is shown in "Reading Mode - Translation"
    // and doesn't affect the global selectedTranslations list
    onSettingsChange(
      'selectedReadingTranslation',
      translationIdStr,
      setSelectedReadingTranslation(translationIdStr),
      setSelectedReadingTranslation(previousValueStr),
      PreferenceGroup.READING,
    );

    onClose();
  };

  return (
    <div className={styles.content}>
      <div className={styles.header}>{t('reading-preference.my-translations')}:</div>
      <div className={styles.divider} />
      <div className={styles.itemsContainer}>
        {availableTranslations.map((translation) => {
          const isSelected = translation.id === currentReadingTranslation;
          return (
            <button
              key={translation.id}
              type="button"
              className={classNames(styles.dropdownItem, {
                [styles.dropdownItemSelected]: isSelected,
              })}
              onClick={() => handleTranslationSelect(translation.id)}
            >
              <span className={styles.translationName}>
                {translation.translatedName?.name || translation.name}
              </span>
            </button>
          );
        })}
      </div>
      <div className={styles.divider} />
      <button type="button" className={styles.settingsItem} onClick={onOpenSettings}>
        <SettingsIcon className={styles.settingsIcon} />
        <span>{t('reading-preference.select-translations')}</span>
      </button>
    </div>
  );
};

export default TranslationDropdownContent;

import React, { useEffect, useRef } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from '../styles/TranslationDropdown.module.scss';

import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import SettingsIcon from '@/public/icons/settings-stroke.svg';
import {
  selectSelectedReadingTranslation,
  setSelectedReadingTranslation,
} from '@/redux/slices/QuranReader/readingPreferences';
import { logValueChange } from '@/utils/eventLogger';
import PreferenceGroup from 'types/auth/PreferenceGroup';
import AvailableTranslation from 'types/AvailableTranslation';

interface TranslationDropdownProps {
  translations: AvailableTranslation[];
  selectedTranslations: number[];
  onClose: () => void;
  onOpenSettings: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement>;
}

const TranslationDropdown: React.FC<TranslationDropdownProps> = ({
  translations,
  selectedTranslations,
  onClose,
  onOpenSettings,
  triggerRef,
}) => {
  const { t } = useTranslation('common');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    actions: { onSettingsChange },
  } = usePersistPreferenceGroup();
  const currentReadingTranslation = useSelector(selectSelectedReadingTranslation);

  // Filter to only show user's selected translations
  const availableTranslations = translations.filter((tr) => selectedTranslations.includes(tr.id));

  // Current primary translation: use selectedReadingTranslation if set, otherwise first in list
  const currentPrimaryId = currentReadingTranslation
    ? Number(currentReadingTranslation)
    : selectedTranslations[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideDropdown = dropdownRef.current?.contains(target);
      const isOnTrigger = triggerRef?.current?.contains(target);

      if (!isInsideDropdown && !isOnTrigger) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleScroll = () => {
      onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [onClose, triggerRef]);

  const handleTranslationSelect = (translationId: number) => {
    if (translationId === currentPrimaryId) {
      onClose();
      return;
    }

    const translationIdStr = String(translationId);
    const previousValue = currentReadingTranslation;

    logValueChange('chapter_header_reading_translation', currentPrimaryId, translationId);

    // Persist selectedReadingTranslation to the backend (PreferenceGroup.READING)
    // This only changes which translation is shown in "Reading Mode - Translation"
    // and doesn't affect the global selectedTranslations list
    onSettingsChange(
      'selectedReadingTranslation',
      translationIdStr,
      setSelectedReadingTranslation(translationIdStr),
      setSelectedReadingTranslation(previousValue),
      PreferenceGroup.READING,
    );

    onClose();
  };

  return (
    <div ref={dropdownRef} className={styles.dropdown}>
      <div className={styles.header}>{t('reading-preference.my-translations')}:</div>
      <div className={styles.divider} />
      <div className={styles.itemsContainer}>
        {availableTranslations.map((translation) => {
          const isSelected = translation.id === currentPrimaryId;
          return (
            <button
              key={translation.id}
              type="button"
              className={classNames(styles.dropdownItem, {
                [styles.dropdownItemSelected]: isSelected,
              })}
              onClick={() => handleTranslationSelect(translation.id)}
            >
              <span className={styles.translationName}>{translation.name}</span>
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

export default TranslationDropdown;

import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './ReadingModeToggle.module.scss';

import useReadingPreferenceSwitcher, {
  SwitcherContext,
} from '@/hooks/useReadingPreferenceSwitcher';
import ReadingModeIcon from '@/public/icons/reading-mode.svg';
import ArabicIcon from '@/public/icons/reading.svg';
import TranslationIcon from '@/public/icons/translation-mode.svg';
import VerseByVerseIcon from '@/public/icons/verse-by-verse.svg';
import { logValueChange } from '@/utils/eventLogger';
import isInReadingMode from '@/utils/readingPreference';
import { ReadingPreference } from 'types/QuranReader';

interface ReadingModeToggleProps {
  isIconsOnly?: boolean;
  context?: SwitcherContext;
}

const ReadingModeToggle: React.FC<ReadingModeToggleProps> = ({
  isIconsOnly = false,
  context = SwitcherContext.ContextMenu,
}) => {
  const { t } = useTranslation('common');
  const { readingPreference, switchReadingPreference } = useReadingPreferenceSwitcher({
    context,
  });

  const isReadingMode = isInReadingMode(readingPreference);

  const handleModeChange = (newMode: ReadingPreference) => {
    if (readingPreference === newMode) return;
    logValueChange(`${context}_reading_mode`, readingPreference, newMode);
    switchReadingPreference(newMode);
  };

  const isVerseByVerseSelected = readingPreference === ReadingPreference.Translation;
  const isArabicSelected = readingPreference === ReadingPreference.Reading;
  const isTranslationSelected = readingPreference === ReadingPreference.ReadingTranslation;

  return (
    <div role="tablist" className={styles.container} aria-label={t('reading-preference.reading')}>
      <button
        type="button"
        role="tab"
        aria-selected={isVerseByVerseSelected}
        className={classNames(styles.pill, {
          [styles.pillSelected]: isVerseByVerseSelected,
          [styles.pillUnselected]: !isVerseByVerseSelected,
        })}
        onClick={() => handleModeChange(ReadingPreference.Translation)}
      >
        <span className={styles.iconContainer}>
          <VerseByVerseIcon
            className={classNames(styles.icon, {
              [styles.iconSelected]: isVerseByVerseSelected,
              [styles.iconUnselected]: !isVerseByVerseSelected,
            })}
          />
        </span>
        {!isIconsOnly && (
          <span className={styles.label}>{t('reading-preference.verse-by-verse')}</span>
        )}
      </button>

      {!isReadingMode ? (
        <button
          type="button"
          role="tab"
          aria-selected={false}
          className={classNames(styles.pill, styles.pillUnselected)}
          onClick={() => handleModeChange(ReadingPreference.Reading)}
        >
          <span className={styles.iconContainer}>
            <ReadingModeIcon className={classNames(styles.icon, styles.iconUnselected)} />
          </span>
          {!isIconsOnly && <span className={styles.label}>{t('reading-preference.reading')}</span>}
        </button>
      ) : (
        <div
          role="group"
          aria-label={t('reading-preference.reading')}
          className={classNames(styles.pill, styles.pillSelected, styles.expandedPill)}
        >
          <button
            type="button"
            role="tab"
            aria-selected={isArabicSelected}
            className={classNames(styles.subOption, {
              [styles.subOptionSelected]: isArabicSelected,
            })}
            onClick={() => handleModeChange(ReadingPreference.Reading)}
          >
            <span className={styles.subOptionIconContainer}>
              <ArabicIcon
                className={classNames(styles.subOptionIcon, {
                  [styles.subOptionIconSelected]: isArabicSelected,
                  [styles.subOptionIconUnselected]: !isArabicSelected,
                })}
              />
            </span>
            {!isIconsOnly && (
              <span className={styles.subOptionLabel}>{t('reading-preference.arabic')}</span>
            )}
          </button>

          <div className={styles.divider} aria-hidden="true" />

          <button
            type="button"
            role="tab"
            aria-selected={isTranslationSelected}
            className={classNames(styles.subOption, {
              [styles.subOptionSelected]: isTranslationSelected,
            })}
            onClick={() => handleModeChange(ReadingPreference.ReadingTranslation)}
          >
            <span className={styles.subOptionIconContainer}>
              <TranslationIcon
                className={classNames(styles.subOptionIcon, {
                  [styles.subOptionIconSelected]: isTranslationSelected,
                  [styles.subOptionIconUnselected]: !isTranslationSelected,
                })}
              />
            </span>
            {!isIconsOnly && (
              <span className={styles.subOptionLabel}>
                {t('reading-preference.reading-translation')}
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReadingModeToggle;

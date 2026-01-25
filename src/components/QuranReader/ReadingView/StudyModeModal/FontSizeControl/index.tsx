/* eslint-disable max-lines */
import React, { useState, useCallback } from 'react';

import { Action } from '@reduxjs/toolkit';
import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from './FontSizeControl.module.scss';

import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import CloseIcon from '@/icons/close.svg';
import MinusIcon from '@/icons/minus.svg';
import PlusIcon from '@/icons/plus.svg';
import {
  MAXIMUM_TAFSIR_FONT_STEP,
  MAXIMUM_REFLECTION_FONT_STEP,
  MAXIMUM_LESSON_FONT_STEP,
  MINIMUM_FONT_STEP,
  selectQuranReaderStyles,
  increaseTafsirFontScale,
  decreaseTafsirFontScale,
  increaseReflectionFontScale,
  decreaseReflectionFontScale,
  increaseQnaFontScale,
  decreaseQnaFontScale,
  increaseLessonFontScale,
  decreaseLessonFontScale,
  MAXIMUM_QURAN_FONT_STEP,
} from '@/redux/slices/QuranReader/styles';
import { logButtonClick, logValueChange } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import PreferenceGroup from 'types/auth/PreferenceGroup';

export type FontSizeType = 'tafsir' | 'reflection' | 'lesson' | 'qna';

interface FontSizeControlProps {
  className?: string;
  fontType?: FontSizeType;
}

const FONT_TYPE_CONFIG = {
  tafsir: {
    key: 'tafsirFontScale' as const,
    maxStep: MAXIMUM_TAFSIR_FONT_STEP,
    increaseAction: increaseTafsirFontScale,
    decreaseAction: decreaseTafsirFontScale,
    logKey: 'tafsir_font_scale',
    defaultValue: 3,
  },
  reflection: {
    key: 'reflectionFontScale' as const,
    maxStep: MAXIMUM_REFLECTION_FONT_STEP,
    increaseAction: increaseReflectionFontScale,
    decreaseAction: decreaseReflectionFontScale,
    logKey: 'reflection_font_scale',
    defaultValue: 3,
  },
  qna: {
    key: 'qnaFontScale' as const,
    maxStep: MAXIMUM_QURAN_FONT_STEP,
    increaseAction: increaseQnaFontScale,
    decreaseAction: decreaseQnaFontScale,
    logKey: 'qna_font_scale',
    defaultValue: 3,
  },
  lesson: {
    key: 'lessonFontScale' as const,
    maxStep: MAXIMUM_LESSON_FONT_STEP,
    increaseAction: increaseLessonFontScale,
    decreaseAction: decreaseLessonFontScale,
    logKey: 'lesson_font_scale',
    defaultValue: 3,
  },
};

const FontSizeControl: React.FC<FontSizeControlProps> = ({ className, fontType = 'tafsir' }) => {
  const { t, lang } = useTranslation('quran-reader');
  const [isExpanded, setIsExpanded] = useState(false);
  const quranReaderStyles = useSelector(selectQuranReaderStyles);
  const config = FONT_TYPE_CONFIG[fontType];
  const currentFontScale = quranReaderStyles[config.key] ?? config.defaultValue;
  const {
    actions: { onSettingsChange },
  } = usePersistPreferenceGroup();

  const onFontSettingsChange = useCallback(
    (key: string, value: number, action: Action, undoAction: Action) => {
      onSettingsChange(key, value, action, undoAction, PreferenceGroup.QURAN_READER_STYLES);
    },
    [onSettingsChange],
  );

  const handleDecrease = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (currentFontScale <= MINIMUM_FONT_STEP) return;
      const newValue = currentFontScale - 1;
      logValueChange(config.logKey, currentFontScale, newValue);
      onFontSettingsChange(config.key, newValue, config.decreaseAction(), config.increaseAction());
    },
    [currentFontScale, onFontSettingsChange, config],
  );

  const handleIncrease = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (currentFontScale >= config.maxStep) return;
      const newValue = currentFontScale + 1;
      logValueChange(config.logKey, currentFontScale, newValue);
      onFontSettingsChange(config.key, newValue, config.increaseAction(), config.decreaseAction());
    },
    [currentFontScale, onFontSettingsChange, config],
  );

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      logButtonClick('study_mode_font_control_toggle', { fontType, isExpanded: true });
      setIsExpanded((prev) => !prev);
    },
    [fontType],
  );

  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      logButtonClick('study_mode_font_control_toggle', { fontType, isExpanded: false });
      setIsExpanded(false);
    },
    [fontType],
  );

  if (!isExpanded) {
    return (
      <div className={classNames(styles.container, className)}>
        <button
          type="button"
          className={styles.toggleButton}
          onClick={handleToggle}
          aria-label={t('aria.adjust-font-size')}
        >
          {/* eslint-disable-next-line i18next/no-literal-string -- "Aa" is a universal font size symbol */}
          <span className={styles.fontSizeLabel}>Aa</span>
        </button>
      </div>
    );
  }

  return (
    <div className={classNames(styles.container, className)}>
      <div className={styles.expandedContainer}>
        {/* eslint-disable-next-line i18next/no-literal-string -- "Aa" is a universal font size symbol */}
        <span className={styles.fontSizeLabel}>Aa</span>
        <button
          type="button"
          className={classNames(styles.controlButton, {
            [styles.disabled]: currentFontScale <= MINIMUM_FONT_STEP,
          })}
          onClick={handleDecrease}
          disabled={currentFontScale <= MINIMUM_FONT_STEP}
          aria-label={t('aria.decrease-font-size')}
        >
          <MinusIcon />
        </button>
        <span className={styles.countDisplay}>{toLocalizedNumber(currentFontScale, lang)}</span>
        <button
          type="button"
          className={classNames(styles.controlButton, {
            [styles.disabled]: currentFontScale >= config.maxStep,
          })}
          onClick={handleIncrease}
          disabled={currentFontScale >= config.maxStep}
          aria-label={t('aria.increase-font-size')}
        >
          <PlusIcon />
        </button>
        <button
          type="button"
          className={styles.closeButton}
          onClick={handleClose}
          aria-label={t('aria.close-font-size-control')}
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
};

export default FontSizeControl;

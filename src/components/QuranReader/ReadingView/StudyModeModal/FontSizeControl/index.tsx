import React, { useState, useCallback } from 'react';

import { Action } from '@reduxjs/toolkit';
import classNames from 'classnames';
import { useSelector } from 'react-redux';

import styles from './FontSizeControl.module.scss';

import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import CloseIcon from '@/icons/close.svg';
import MinusIcon from '@/icons/minus.svg';
import PlusIcon from '@/icons/plus.svg';
import {
  MAXIMUM_TAFSIR_FONT_STEP,
  MAXIMUM_REFLECTION_FONT_STEP,
  MINIMUM_FONT_STEP,
  selectQuranReaderStyles,
  increaseTafsirFontScale,
  decreaseTafsirFontScale,
  increaseReflectionFontScale,
  decreaseReflectionFontScale,
} from '@/redux/slices/QuranReader/styles';
import { logValueChange } from '@/utils/eventLogger';
import PreferenceGroup from 'types/auth/PreferenceGroup';

export type FontSizeType = 'tafsir' | 'reflection';

interface FontSizeControlProps {
  className?: string;
  fontType?: FontSizeType;
}

// Configuration for each font type
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
};

const FontSizeControl: React.FC<FontSizeControlProps> = ({ className, fontType = 'tafsir' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const quranReaderStyles = useSelector(selectQuranReaderStyles);
  const config = FONT_TYPE_CONFIG[fontType];
  // Use fallback default for users who don't have the new reflectionFontScale field yet
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

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  }, []);

  const handleClose = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(false);
  }, []);

  if (!isExpanded) {
    return (
      <div className={classNames(styles.container, className)}>
        <button
          type="button"
          className={styles.toggleButton}
          onClick={handleToggle}
          aria-label="Adjust font size"
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
          aria-label="Decrease font size"
        >
          <MinusIcon />
        </button>
        <span className={styles.countDisplay}>{currentFontScale}</span>
        <button
          type="button"
          className={classNames(styles.controlButton, {
            [styles.disabled]: currentFontScale >= config.maxStep,
          })}
          onClick={handleIncrease}
          disabled={currentFontScale >= config.maxStep}
          aria-label="Increase font size"
        >
          <PlusIcon />
        </button>
        <button
          type="button"
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Close font size control"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
};

export default FontSizeControl;

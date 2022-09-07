/* eslint-disable react/no-danger */
import React from 'react';

import { Action } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';

import styles from './TafsirText.module.scss';

import Counter from '@/dls/Counter/Counter';
import SpinnerContainer from '@/dls/Spinner/SpinnerContainer';
import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import {
  MAXIMUM_TAFSIR_FONT_STEP,
  MINIMUM_FONT_STEP,
  selectQuranReaderStyles,
  increaseTafsirFontScale,
  decreaseTafsirFontScale,
} from '@/redux/slices/QuranReader/styles';
import { logValueChange } from '@/utils/eventLogger';
import PreferenceGroup from 'types/auth/PreferenceGroup';

type TafsirTextProps = {
  direction: string;
  languageCode: string;
  text: string;
};

const FONT_SIZE_CLASS_MAP = {
  1: styles.xs,
  2: styles.sm,
  3: styles.md,
  4: styles.lg,
  5: styles.xl,
};

const TafsirText: React.FC<TafsirTextProps> = ({ direction, languageCode, text }) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles);
  const {
    actions: { onSettingsChange },
    isLoading,
  } = usePersistPreferenceGroup();
  const { tafsirFontScale } = quranReaderStyles;

  /**
   * Persist settings in the DB if the user is logged in before dispatching
   * Redux action, otherwise just dispatch it.
   *
   * @param {string} key
   * @param {number} value
   * @param {Action} action
   */
  const onTafsirsSettingsChange = (
    key: string,
    value: number,
    action: Action,
    undoAction: Action,
  ) => {
    onSettingsChange(key, value, action, undoAction, PreferenceGroup.QURAN_READER_STYLES);
  };

  const onFontScaleDecreaseClicked = () => {
    const newValue = tafsirFontScale - 1;
    logValueChange('tafsir_font_scale', tafsirFontScale, newValue);
    onTafsirsSettingsChange(
      'tafsirFontScale',
      newValue,
      decreaseTafsirFontScale(),
      increaseTafsirFontScale(),
    );
  };

  const onFontScaleIncreaseClicked = () => {
    const newValue = tafsirFontScale + 1;
    logValueChange('tafsir_font_scale', tafsirFontScale, newValue);
    onTafsirsSettingsChange(
      'tafsirFontScale',
      newValue,
      increaseTafsirFontScale(),
      decreaseTafsirFontScale(),
    );
  };
  return (
    <>
      <div dir={direction} className={styles.counter}>
        <SpinnerContainer isLoading={isLoading}>
          <Counter
            count={tafsirFontScale}
            onDecrement={tafsirFontScale === MINIMUM_FONT_STEP ? null : onFontScaleDecreaseClicked}
            onIncrement={
              tafsirFontScale === MAXIMUM_TAFSIR_FONT_STEP ? null : onFontScaleIncreaseClicked
            }
          />
        </SpinnerContainer>
      </div>
      <div
        className={FONT_SIZE_CLASS_MAP[tafsirFontScale]}
        dir={direction}
        lang={languageCode}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    </>
  );
};
export default TafsirText;

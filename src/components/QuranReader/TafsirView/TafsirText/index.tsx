/* eslint-disable react/no-danger */
import React from 'react';

import { Action } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import styles from './TafsirText.module.scss';

import Counter from 'src/components/dls/Counter/Counter';
import {
  MAXIMUM_TAFSIR_FONT_STEP,
  MINIMUM_FONT_STEP,
  selectQuranReaderStyles,
  increaseTafsirFontScale,
  decreaseTafsirFontScale,
} from 'src/redux/slices/QuranReader/styles';
import { addOrUpdateUserPreference } from 'src/utils/auth/api';
import { isLoggedIn } from 'src/utils/auth/login';
import { logValueChange } from 'src/utils/eventLogger';
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
  const dispatch = useDispatch();
  const quranReaderStyles = useSelector(selectQuranReaderStyles);
  const { tafsirFontScale } = quranReaderStyles;

  /**
   * Persist settings in the DB if the user is logged in before dispatching
   * Redux action, otherwise just dispatch it.
   *
   * @param {string} key
   * @param {number} value
   * @param {Action} action
   */
  const onSettingsChange = (key: string, value: number, action: Action) => {
    if (isLoggedIn()) {
      const newQuranReaderStyles = { ...quranReaderStyles };
      // no need to persist this since it's calculated and only used internally
      delete newQuranReaderStyles.isUsingDefaultFont;
      newQuranReaderStyles[key] = value;
      addOrUpdateUserPreference(newQuranReaderStyles, PreferenceGroup.QURAN_READER_STYLES)
        .then(() => {
          dispatch(action);
        })
        .catch(() => {
          // TODO: show an error
        });
    } else {
      dispatch(action);
    }
  };

  const onFontScaleDecreaseClicked = () => {
    const newValue = tafsirFontScale - 1;
    logValueChange('tafsir_font_scale', tafsirFontScale, newValue);
    onSettingsChange('tafsirFontScale', newValue, decreaseTafsirFontScale());
  };

  const onFontScaleIncreaseClicked = () => {
    const newValue = tafsirFontScale + 1;
    logValueChange('tafsir_font_scale', tafsirFontScale, newValue);
    onSettingsChange('tafsirFontScale', newValue, increaseTafsirFontScale());
  };
  return (
    <>
      <div dir={direction} className={styles.counter}>
        <Counter
          count={tafsirFontScale}
          onDecrement={tafsirFontScale === MINIMUM_FONT_STEP ? null : onFontScaleDecreaseClicked}
          onIncrement={
            tafsirFontScale === MAXIMUM_TAFSIR_FONT_STEP ? null : onFontScaleIncreaseClicked
          }
        />
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

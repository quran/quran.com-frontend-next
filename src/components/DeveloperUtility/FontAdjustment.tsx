/* eslint-disable i18next/no-literal-string */
import React from 'react';

import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import {
  selectQuranReaderStyles,
  MAXIMUM_TAFSIR_FONT_STEP,
  MAXIMUM_QURAN_FONT_STEP,
  MAXIMUM_TRANSLATIONS_FONT_STEP,
  setQuranFontAction,
  increaseQuranTextFontScaleAction,
  decreaseQuranTextFontScaleAction,
  decreaseTranslationFontScaleAction,
  increaseTranslationFontScaleAction,
  decreaseTafsirFontScaleAction,
  increaseTafsirFontScaleAction,
} from '@/redux/slices/QuranReader/styles';
import { QuranFont } from 'types/QuranReader';

/**
 * Adjusts the font type and styles
 *
 * @returns {JSX.Element}
 */
const FontAdjustment = (): JSX.Element => {
  const dispatch = useDispatch();
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const { quranTextFontScale, quranFont, translationFontScale, tafsirFontScale } =
    quranReaderStyles;
  const availableFonts = [];

  Object.values(QuranFont).forEach((font) => availableFonts.push(font));

  return (
    <>
      {/* Font style */}
      <label htmlFor="font-styles">
        Font style{' '}
        <select
          name="font-styles"
          onChange={(event) => dispatch(setQuranFontAction(event.target.value))}
          value={quranFont}
        >
          {availableFonts.map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>
      </label>
      {/* Quran Font size */}
      <div>
        Quran font size ({quranTextFontScale}){' '}
        <button
          onClick={() => dispatch(decreaseQuranTextFontScaleAction())}
          type="button"
          disabled={quranTextFontScale === 1}
        >
          -
        </button>{' '}
        <button
          onClick={() => dispatch(increaseQuranTextFontScaleAction())}
          type="button"
          disabled={quranTextFontScale === MAXIMUM_QURAN_FONT_STEP}
        >
          +
        </button>
      </div>
      {/* Translation Font size */}
      <div>
        Translation font size ({translationFontScale}){' '}
        <button
          onClick={() => dispatch(decreaseTranslationFontScaleAction())}
          type="button"
          disabled={translationFontScale === 1}
        >
          -
        </button>{' '}
        <button
          onClick={() => dispatch(increaseTranslationFontScaleAction())}
          type="button"
          disabled={translationFontScale === MAXIMUM_TRANSLATIONS_FONT_STEP}
        >
          +
        </button>
      </div>
      {/* Tafsir Font size */}
      <div>
        Tafsir font size ({tafsirFontScale}){' '}
        <button
          onClick={() => dispatch(decreaseTafsirFontScaleAction())}
          type="button"
          disabled={tafsirFontScale === 1}
        >
          -
        </button>{' '}
        <button
          onClick={() => dispatch(increaseTafsirFontScaleAction())}
          type="button"
          disabled={tafsirFontScale === MAXIMUM_TAFSIR_FONT_STEP}
        >
          +
        </button>
      </div>
    </>
  );
};

export default FontAdjustment;

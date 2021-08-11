import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  decreaseQuranTextSize,
  decreaseTranslationTextSize,
  increaseQuranTextSize,
  increaseTranslationTextSize,
  increaseTafsirTextSize,
  decreaseTafsirTextSize,
  selectQuranReaderStyles,
  setQuranFont,
} from 'src/redux/slices/QuranReader/styles';
import { QuranFont } from '../QuranReader/types';

/**
 * Adjusts the font type and styles
 */
const FontAdjustment = () => {
  const dispatch = useDispatch();
  const quranReaderStyles = useSelector(selectQuranReaderStyles);
  const availableFonts = [];

  Object.values(QuranFont).forEach((font) => availableFonts.push(font));

  return (
    <>
      {/* Font style */}
      <label htmlFor="font-styles">
        Font style{' '}
        <select
          name="font-styles"
          onChange={(event) => dispatch({ type: setQuranFont.type, payload: event.target.value })}
          value={quranReaderStyles.quranFont}
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
        Quran font size{' '}
        <button onClick={() => dispatch({ type: decreaseQuranTextSize.type })} type="button">
          -
        </button>{' '}
        <button onClick={() => dispatch({ type: increaseQuranTextSize.type })} type="button">
          +
        </button>
      </div>
      {/* Translation Font size */}
      <div>
        Translation font size{' '}
        <button onClick={() => dispatch({ type: decreaseTranslationTextSize.type })} type="button">
          -
        </button>{' '}
        <button onClick={() => dispatch({ type: increaseTranslationTextSize.type })} type="button">
          +
        </button>
      </div>
      {/* Tafsir Font size */}
      <div>
        Tafsir font size{' '}
        <button onClick={() => dispatch({ type: decreaseTafsirTextSize.type })} type="button">
          -
        </button>{' '}
        <button onClick={() => dispatch({ type: increaseTafsirTextSize.type })} type="button">
          +
        </button>
      </div>
    </>
  );
};

export default FontAdjustment;

/* eslint-disable react/no-danger */
import React from 'react';

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
import { logValueChange } from 'src/utils/eventLogger';

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

  const onFontScaleDecreaseClicked = () => {
    logValueChange('tafsir_font_scale', tafsirFontScale, tafsirFontScale - 1);
    dispatch(decreaseTafsirFontScale());
  };

  const onFontScaleIncreaseClicked = () => {
    logValueChange('tafsir_font_scale', tafsirFontScale, tafsirFontScale + 1);
    dispatch(increaseTafsirFontScale());
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

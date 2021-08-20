import React from 'react';
import Word, { CharType } from 'types/Word';
import { QuranFont } from 'src/components/QuranReader/types';
import { isQCFFont } from 'src/utils/fontFaceHelper';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { selectReadingPreferences } from 'src/redux/slices/QuranReader/readingPreferences';
import TextWord from './TextWord';
import GlyphWord from './GlyphWord';
import styles from './QuranWord.module.scss';

type QuranWordProps = {
  word: Word;
  font?: QuranFont;
  highlight?: boolean;
};

const getGlyph = (word: Word, font: QuranFont) => {
  if (font === QuranFont.MadaniV1) return word.codeV1;
  return word.codeV2;
};

const QuranWord = ({ word, font, highlight }: QuranWordProps) => {
  const { showWordByWordTranslation, showWordByWordTransliteration } =
    useSelector(selectReadingPreferences);
  const isWordByWordLayout = showWordByWordTranslation || showWordByWordTransliteration;
  let wordText = null;

  if (isQCFFont(font)) {
    wordText = <GlyphWord font={font} text={getGlyph(word, font)} pageNumber={word.pageNumber} />;
  } else if (word.charTypeName !== CharType.Pause) {
    wordText = <TextWord font={font} text={word.text} charType={word.charTypeName} />;
  }

  return (
    <div
      className={classNames(styles.container, {
        [styles.highlighted]: highlight,
        [styles.wbwContainer]: isWordByWordLayout,
      })}
    >
      {wordText}
      {showWordByWordTransliteration && (
        <p className={styles.wbwText}>{word.transliteration?.text}</p>
      )}
      {showWordByWordTranslation && <p className={styles.wbwText}>{word.translation?.text}</p>}
    </div>
  );
};

export default QuranWord;

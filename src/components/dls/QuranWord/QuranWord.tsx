import React from 'react';
import Word, { CharType } from 'types/Word';
import { QuranFont } from 'src/components/QuranReader/types';
import { isQCFFont } from 'src/utils/fontFaceHelper';
import classNames from 'classnames';
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
  if (word.charTypeName === CharType.Pause) {
    return null;
  }
  const wordText = isQCFFont(font) ? (
    <GlyphWord font={font} text={getGlyph(word, font)} pageNumber={word.pageNumber} />
  ) : (
    <TextWord font={font} text={word.text} charType={word.charTypeName} />
  );

  return (
    <>
      {word.isAfterLineBreak && <br />}
      <span className={classNames(styles.container, { [styles.highlighted]: highlight })}>
        {wordText}
      </span>
    </>
  );
};

export default QuranWord;

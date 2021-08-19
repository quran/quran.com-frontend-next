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
  highlighted?: boolean;
};

const getGlyph = (word: Word, font: QuranFont) => {
  if (font === QuranFont.MadaniV1) return word.codeV1;
  return word.codeV2;
};

const QuranWord = ({ word, font, highlighted: highlight }: QuranWordProps) => {
  let wordText;

  if (isQCFFont(font)) {
    wordText = <GlyphWord font={font} text={getGlyph(word, font)} pageNumber={word.pageNumber} />;
  } else {
    wordText =
      word.charTypeName === CharType.Pause ? (
        ''
      ) : (
        <TextWord font={font} text={word.text} charType={word.charTypeName} />
      );
  }

  return (
    <span className={classNames(styles.container, { [styles.highlighted]: highlight })}>
      {wordText}
    </span>
  );
};

export default QuranWord;

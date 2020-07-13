import React from 'react';
import WordType from 'types/WordType';
import { QuranFont } from 'src/components/QuranReader/types';
import IndoPakWordText from './IndoPakWordText';
import MadaniWordText from './MadaniWordText';
import UthmaniWordText from './UthmaniWordText';

type QuranWordProps = {
  word: WordType;
  fontStyle?: QuranFont;
  highlight?: boolean;
};

const QuranWord = ({ word, fontStyle }: QuranWordProps) => {
  let WordText;

  if (fontStyle === QuranFont.Uthmani) {
    WordText = <UthmaniWordText code={word.code} pageNumber={word.pageNumber} />;
  } else if (fontStyle === QuranFont.IndoPak) {
    WordText = <IndoPakWordText text={word.textMadani} />;
  } else {
    WordText = <MadaniWordText text={word.textMadani} />;
  }

  return WordText;
};

export default QuranWord;

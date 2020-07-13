import React from 'react';
import WordType from 'types/WordType';
import { QuranFonts } from 'src/components/QuranReader/types';
import IndoPakWordText from './IndoPakWordText';
import MadaniWordText from './MadaniWordText';
import UthmaniWordText from './UthmaniWordText';

type QuranWordProps = {
  word: WordType;
  fontStyle?: QuranFonts;
  highlight?: boolean;
};

const QuranWord = ({ word, fontStyle }: QuranWordProps) => {
  let WordText;
  if (fontStyle === QuranFonts.Uthmani) {
    WordText = <UthmaniWordText code={word.code} pageNumber={word.pageNumber} />;
  } else if (fontStyle === QuranFonts.IndoPak) {
    WordText = <IndoPakWordText text={word.textMadani} />;
  } else {
    WordText = <MadaniWordText text={word.textMadani} />;
  }

  return WordText;
};

export default QuranWord;

import React from 'react';
import WordType from 'types/WordType';
import IndoPakWordText from './IndoPakWordText';
import MadaniWordText from './MadaniWordText';
import UthmaniWordText from './UthmaniWordText';

type QuranWordProps = {
  word: WordType;
  fontStyle?: 'textMadani' | 'uthmani' | 'indopak';
  highlight?: boolean;
};

const QuranWord = (props: QuranWordProps) => {
  const { word, fontStyle } = props;
  let WordText;

  if (fontStyle === 'uthmani') {
    WordText = <UthmaniWordText code={word.code} pageNumber={word.pageNumber} />;
  } else if (fontStyle === 'indopak') {
    WordText = <IndoPakWordText text={word.textMadani} />;
  } else {
    WordText = <MadaniWordText text={word.textMadani} />;
  }

  return WordText;
};

export default QuranWord;

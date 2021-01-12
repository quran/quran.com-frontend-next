import React from 'react';
import WordType, { CharType } from 'types/WordType';
import { QuranFont } from 'src/components/QuranReader/types';
import styled from 'styled-components';
import IndoPakWordText from './IndoPakWordText';
import MadaniWordText from './MadaniWordText';
import UthmaniWordText from './UthmaniWordText';

type QuranWordProps = {
  word: WordType;
  fontStyle?: QuranFont;
  highlight?: boolean;
};

const QuranWord = ({ word, fontStyle, highlight }: QuranWordProps) => {
  let WordText;

  // Render all words except ayah markers
  if (fontStyle === QuranFont.Uthmani || word.charType !== CharType.End) {
    if (fontStyle === QuranFont.Uthmani) {
      WordText = <UthmaniWordText code={word.code} pageNumber={word.pageNumber} />;
    } else if (fontStyle === QuranFont.IndoPak) {
      WordText = <IndoPakWordText text={word.textMadani} />;
    } else {
      WordText = <MadaniWordText text={word.textMadani} />;
    }
  } else {
    // Render ayah markers
    // Extract the verse number and convert it to Arabic digits
    const arabicVerseNumber = parseInt(
      word.verseKey.substring(word.verseKey.indexOf(':') + 1),
      10,
    ).toLocaleString('ar-EG');

    // reverse the arabic digits such that they're displayed as 10, 11, 12.. instead of 01, 11, 21
    const reversedArabicVerseNumber = arabicVerseNumber.split('').reverse().join('');
    WordText = <MadaniWordText text={`${reversedArabicVerseNumber} `} />;
  }

  return <StyledWordContainer highlight={highlight}>{WordText}</StyledWordContainer>;
};

type StyledWordContainerProps = {
  highlight?: boolean;
};

const StyledWordContainer = styled.span<StyledWordContainerProps>`
  color: ${(props) => props.highlight && props.theme.colors.primary};
`;

export default QuranWord;

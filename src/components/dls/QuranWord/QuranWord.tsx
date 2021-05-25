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

const QCFFontCodes = [QuranFont.MadaniV1, QuranFont.MadaniV2];

const QuranWord = ({ word, fontStyle, highlight }: QuranWordProps) => {
  let wordText;

  if (QCFFontCodes.includes(fontStyle)) {
    wordText = (
      <UthmaniWordText
        fontVersion={fontStyle}
        code={fontStyle === QuranFont.MadaniV1 ? word.codeV1 : word.codeV2}
        pageNumber={word.pageNumber}
      />
    );
  } else if (word.charType !== CharType.End) {
    // Render all words except ayah markers

    if (fontStyle === QuranFont.IndoPak) {
      wordText = <IndoPakWordText text={word.textIndopak} />;
    } else {
      wordText = <MadaniWordText text={word.textUthmani} />;
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
    wordText = <MadaniWordText text={`${reversedArabicVerseNumber} `} />;
  }

  return <StyledWordContainer highlight={highlight}>{wordText}</StyledWordContainer>;
};

type StyledWordContainerProps = {
  highlight?: boolean;
};

const StyledWordContainer = styled.span<StyledWordContainerProps>`
  color: ${(props) => props.highlight && props.theme.colors.primary.medium};
`;

export default QuranWord;

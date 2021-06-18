import React from 'react';
import WordType from 'types/WordType';
import { QuranFont } from 'src/components/QuranReader/types';
import styled from 'styled-components';
import MadaniWordText from './MadaniWordText';
import UthmaniWordText from './UthmaniWordText';

type QuranWordProps = {
  word: WordType;
  font?: QuranFont;
  highlight?: boolean;
};

const QCFFontCodes = [QuranFont.MadaniV1, QuranFont.MadaniV2];

const QuranWord = ({ word, font, highlight }: QuranWordProps) => {
  let wordText;

  if (QCFFontCodes.includes(font)) {
    wordText = <UthmaniWordText font={font} code={word.text} pageNumber={word.pageNumber} />;
  } else {
    // Render all words except ayah markers
    wordText = <MadaniWordText font={font} text={word.text} charType={word.charTypeName} />;
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

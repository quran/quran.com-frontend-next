import React from 'react';
import WordType from 'types/WordType';
import { QuranFont } from 'src/components/QuranReader/types';
import styled from 'styled-components';
import IndoPakWordText from './IndoPakWordText';
import MadaniWordText from './MadaniWordText';
import UthmaniWordText from './UthmaniWordText';

type QuranWordProps = {
  word: WordType;
  fontStyle?: QuranFont;
  highlight?: boolean;
  highlightBackground?: boolean;
};

const QuranWord = ({ word, fontStyle, highlight, highlightBackground }: QuranWordProps) => {
  let WordText;

  if (fontStyle === QuranFont.Uthmani) {
    WordText = <UthmaniWordText code={word.code} pageNumber={word.pageNumber} />;
  } else if (fontStyle === QuranFont.IndoPak) {
    WordText = <IndoPakWordText text={word.textMadani} />;
  } else {
    WordText = <MadaniWordText text={word.textMadani} />;
  }

  return (
    <StyledWordContainer highlight={highlight} highlightBackground={highlightBackground}>
      {WordText}
    </StyledWordContainer>
  );
};

type StyledWordContainerProps = {
  highlight: boolean;
  highlightBackground?: boolean;
};

const StyledWordContainer = styled.span<StyledWordContainerProps>`
  color: ${(props) => props.highlight && props.theme.colors.primary};
  background: ${(props) => props.highlightBackground && props.theme.colors.gray};
`;

export default QuranWord;

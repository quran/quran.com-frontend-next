import React from 'react';
import Word from 'types/Word';
import { QuranFont } from 'src/components/QuranReader/types';
import styled from 'styled-components';
import { isQCFFont } from 'src/utils/fontFaceHelper';
import TextWord from './TextWord';
import GlypWord from './GlypWord';

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
  let wordText;

  if (isQCFFont(font)) {
    wordText = <GlypWord font={font} text={getGlyph(word, font)} pageNumber={word.pageNumber} />;
  } else {
    wordText =
      word.charTypeName === 'pause' ? (
        ''
      ) : (
        <TextWord font={font} text={word.text} charType={word.charTypeName} />
      );
  }

  return <StyledWordContainer highlight={highlight}>{wordText}</StyledWordContainer>;
};

type StyledWordContainerProps = {
  highlight?: boolean;
};

const StyledWordContainer = styled.span<StyledWordContainerProps>`
  color: ${(props) => props.highlight && props.theme.colors.primary.medium};
  display: inline-block;
`;

export default QuranWord;

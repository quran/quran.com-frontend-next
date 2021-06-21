import React from 'react';
import styled from 'styled-components';

type UthmaniWordTextProps = {
  text: string;
  pageNumber: number;
  font: string;
};

const fixFontName = (version) => version.replace('code_', '');

const GlypWord = ({ text, pageNumber, font }: UthmaniWordTextProps) => {
  return (
    // eslint-disable-next-line react/no-danger
    <StyledUthmaniWordText
      font={fixFontName(font)}
      pageNumber={pageNumber}
      dangerouslySetInnerHTML={{ __html: text }}
    />
  );
};

const StyledUthmaniWordText = styled.span<{ pageNumber: number; font: string }>`
  line-height: normal;
  font-family: ${(props) => `p${props.pageNumber}-${props.font}`};
`;
export default GlypWord;

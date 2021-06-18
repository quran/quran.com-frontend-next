import React from 'react';
import styled from 'styled-components';

type UthmaniWordTextProps = {
  code: string;
  pageNumber: number;
  font: string;
};

const fixFontName = (version) => version.replace('code_', '');

const UthmaniWordText = ({ code, pageNumber, font }: UthmaniWordTextProps) => {
  return (
    // eslint-disable-next-line react/no-danger
    <StyledUthmaniWordText
      font={fixFontName(font)}
      pageNumber={pageNumber}
      dangerouslySetInnerHTML={{ __html: code }}
    />
  );
};

const StyledUthmaniWordText = styled.span<{ pageNumber: number; font: string }>`
  font-family: ${(props) => `p${props.pageNumber}-${props.font}`};
`;
export default UthmaniWordText;

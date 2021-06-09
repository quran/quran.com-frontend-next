import React from 'react';
import styled from 'styled-components';

type UthmaniWordTextProps = {
  code: string;
  pageNumber: number;
  fontVersion: string;
};

const fixVersionName = (version) => version.replace('code_', '');

const UthmaniWordText = ({ code, pageNumber, fontVersion }: UthmaniWordTextProps) => {
  return (
    // eslint-disable-next-line react/no-danger
    <StyledUthmaniWordText
      fontVersion={fixVersionName(fontVersion)}
      pageNumber={pageNumber}
      dangerouslySetInnerHTML={{ __html: code }}
    />
  );
};

const StyledUthmaniWordText = styled.span<{ pageNumber: number; fontVersion: string }>`
  font-family: ${(props) => `p${props.pageNumber}-${props.fontVersion}`};
`;
export default UthmaniWordText;

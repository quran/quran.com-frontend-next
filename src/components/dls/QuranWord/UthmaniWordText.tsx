import React from 'react';
import styled from 'styled-components';

type UthmaniWordTextProps = {
  code: string;
  pageNumber: number;
};

const UthmaniWordText = ({ code, pageNumber }: UthmaniWordTextProps) => {
  return (
    // eslint-disable-next-line react/no-danger
    <StyledUthmaniWordText pageNumber={pageNumber} dangerouslySetInnerHTML={{ __html: code }} />
  );
};

const StyledUthmaniWordText = styled.span<{ pageNumber: number }>`
  font-family: ${(props) => `p${props.pageNumber}`};
`;
export default UthmaniWordText;

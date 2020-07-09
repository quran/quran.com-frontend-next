import React from 'react';
import styled from 'styled-components';

type UthmaniWordTextProps = {
  code: string;
  pageNumber: number;
  wordId?: number;
};

const UthmaniWordText = (props: UthmaniWordTextProps) => {
  const { code, pageNumber } = props;

  // eslint-disable-next-line react/no-danger
  return (
    <StyledUthmaniWordText pageNumber={pageNumber} dangerouslySetInnerHTML={{ __html: code }} />
  );
};

const StyledUthmaniWordText = styled.span<{ pageNumber: number }>`
  font-family: ${(props) => `p${props.pageNumber}`};
`;
export default UthmaniWordText;

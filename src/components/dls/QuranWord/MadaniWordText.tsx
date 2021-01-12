import React from 'react';
import styled from 'styled-components';

type MadaniWordTextProps = {
  text: string;
};

const MadaniWordText = (props: MadaniWordTextProps) => {
  const { text } = props;
  return <StyledMadaniWordText>{`${text} `}</StyledMadaniWordText>;
};

const StyledMadaniWordText = styled.span`
  font-family: Madani;
`;
export default MadaniWordText;

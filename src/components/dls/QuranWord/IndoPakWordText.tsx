import React from 'react';
import styled from 'styled-components';

type IndoPakWordTextProps = {
  text: string;
};

const IndoPakWordText = (props: IndoPakWordTextProps) => {
  const { text } = props;
  return <StyledIndoPakWordText>{text}</StyledIndoPakWordText>;
};

const StyledIndoPakWordText = styled.span`
  font-family: IndoPak;
`;

export default IndoPakWordText;

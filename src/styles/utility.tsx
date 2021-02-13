import React from 'react';
import styled from 'styled-components';

export const CENTER_VERTICALLY = `
  display: flex;
  flex-direction: column;
  justify-content: center;`;

export const CenterVertically = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const CENTER_HORIZONTALLY = `
  display: inline-block;
  margin: auto;  
`;

export const CenterHorizontally = styled.div``;

const CenterHorizontallyVertically = ({ children }) => {
  return (
    <CenterVertically>
      <CenterHorizontally>{children}</CenterHorizontally>
    </CenterVertically>
  );
};

export default { CenterVertically, CenterHorizontally, CenterHorizontallyVertically };

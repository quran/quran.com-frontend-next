import React from 'react';
import styled from 'styled-components';

const AnchorStyle = styled.a`
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.grey.grey2};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Anchor = ({ href, children }: { href: string; children: any }) => (
  <AnchorStyle href={href} target="_blank" rel="noopener noreferrer">
    {children}
  </AnchorStyle>
);

export default Anchor;

import React from 'react';
import { Container } from 'styled-bootstrap-grid';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  padding: 2rem 0;
  margin-top: 10rem;
`;

const Footer = () => (
  <FooterContainer>
    <Container />
  </FooterContainer>
);

export default Footer;

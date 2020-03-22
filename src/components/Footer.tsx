import React from 'react';
import { Container, Row, Col } from 'styled-bootstrap-grid';
import styled from 'styled-components';
import Link from './Link';

const FooterContainer = styled.footer`
  padding: 2rem 0;
  margin-top: 10rem;
`;

const Text = styled.p`
  font-family: Maison Neue;
  font-size: 1rem;
`;

const Footer = () => (
  <FooterContainer>
    <Container>
      <Row>
        <Col xl="4">
          <Text>Made by @bnj</Text>
        </Col>
        <Col xl="4">
          <Link>Submit event</Link>
        </Col>
        <Col xl="4">
          <Link>Contact</Link>
        </Col>
      </Row>
    </Container>
  </FooterContainer>
);

export default Footer;

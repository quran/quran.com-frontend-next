/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { Container, Row, Col } from 'styled-bootstrap-grid';
import styled from 'styled-components';
import Link from 'next-translate/Link';
import content from './content.json';
import Copyright from './Copyright';

const FooterContainer = styled.footer`
  padding: 2rem 0;
  padding-bottom: 48px;
  margin-top: 10rem;
  background-color: #eee;
  font-size: 14px;
  line-height: 21px;

  .ml-auto {
    margin-left: auto;
  }

  .mb-4 {
    margin-bottom: 24px;
  }

  .footer-tab {
    margin-bottom: 20px;

    ul {
      margin-bottom: 16px;
    }
  }

  h4 {
    color: ${({ theme }) => theme.colors.text};
    font-size: 20px;
    margin-bottom: 8px;
    font-weight: bold;
    line-height: 24px;
  }

  li {
    margin: 5px 0;
  }
`;

const StyledLink = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  /* font-size: 14px; */
`;

const Footer = () => (
  <FooterContainer>
    <Container>
      <Row>
        {content.tabs.map(({ tab, links }) => (
          <Col col sm={6} md={3} lg={2} key={tab}>
            <div className="footer-tab">
              <h4>
                <span className="en">{tab}</span>
              </h4>
              <ul>
                {links.map(({ href, target, text }) => (
                  <li key={href}>
                    <Link href={href} passHref>
                      <StyledLink target={target && target} rel={target && 'noopener noreferrer'}>
                        <span className="en">{text}</span>
                      </StyledLink>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Col>
        ))}

        <Copyright />
      </Row>
    </Container>
  </FooterContainer>
);

export default Footer;

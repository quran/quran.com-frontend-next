/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { Container, Row, Col } from 'styled-bootstrap-grid';
import styled from 'styled-components';
import Link from 'next-translate/Link';

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

  .copyright {
    color: ${({ theme }) => theme.colors.text};
    /* font-size: 14px; */
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
        <Col col sm={6} md={3} lg={2}>
          <div className="footer-tab">
            <h4>
              <span className="en">Navigate</span>
            </h4>
            <ul>
              <li>
                <Link href="/about-us" passHref>
                  <StyledLink>
                    <span className="en">About us</span>
                  </StyledLink>
                </Link>
              </li>
              <li>
                <Link href="/donations" passHref>
                  <StyledLink>
                    <span className="en">Contribute</span>
                  </StyledLink>
                </Link>
              </li>
              <li>
                <Link href="/support" passHref>
                  <StyledLink>
                    <span className="en">Help &amp; feedback</span>
                  </StyledLink>
                </Link>
              </li>
              <li>
                <Link href="/developers" passHref>
                  <StyledLink>
                    <span className="en">Developers</span>
                  </StyledLink>
                </Link>
              </li>
              <li>
                <Link href="/apps" passHref>
                  <StyledLink>
                    <span className="en">Download</span>
                  </StyledLink>
                </Link>
              </li>
            </ul>
          </div>
        </Col>

        <Col col sm={6} md={3} lg={2}>
          <div className="footer-tab">
            <h4>
              <span className="en">Useful sites</span>
            </h4>
            <ul>
              <li>
                <Link href="https://quranicaudio.com/" passHref>
                  <StyledLink target="_blank" rel="noopener noreferrer">
                    Quraninaudio.com
                  </StyledLink>
                </Link>
              </li>
              <li>
                <Link href="https://salah.com/" passHref>
                  <StyledLink target="_blank" rel="noopener noreferrer">
                    Salah.com
                  </StyledLink>
                </Link>
              </li>
              <li>
                <Link href="https://sunnah.com/" passHref>
                  <StyledLink target="_blank" rel="noopener noreferrer">
                    Sunnah.com
                  </StyledLink>
                </Link>
              </li>
              <li>
                <Link href="https://legacy.quran.com/" passHref>
                  <StyledLink target="_blank" rel="noopener noreferrer">
                    Legacy Quran.com
                  </StyledLink>
                </Link>
              </li>
              <li>
                <Link href="https://corpus.quran.com/wordbyword.jsp" passHref>
                  <StyledLink target="_blank" rel="noopener noreferrer">
                    Corpus.Quran.com
                  </StyledLink>
                </Link>
              </li>
            </ul>
          </div>
        </Col>

        <Col col sm={6} md={3} lg={2}>
          <div className="footer-tab">
            <h4>
              <span className="en">Other links</span>
            </h4>
            <ul>
              <li>
                <Link href="https://quran.com/sitemap.xml.gz" passHref>
                  <StyledLink target="_blank" rel="noopener noreferrer">
                    Sitemap
                  </StyledLink>
                </Link>
              </li>
              <li>
                <Link href="https://quran.com/36" passHref>
                  <StyledLink target="_blank" rel="noopener noreferrer">
                    Surah Yaseen (يس)
                  </StyledLink>
                </Link>
              </li>
              <li>
                <Link href="https://quran.com/2/255" passHref>
                  <StyledLink target="_blank" rel="noopener noreferrer">
                    Ayat Al-Kursi (آية الكرسي)
                  </StyledLink>
                </Link>
              </li>
            </ul>
          </div>
        </Col>

        <Col col sm={12} md={6} lg={4} className="ml-auto">
          <div className="copyright">
            <p className="mb-4">
              <span className="en">
                Quran.com is a Sadaqah Jariyah. We hope to make it easy for everyone to read, study,
                and learn The Noble Quran. The Noble Quran has many names including Al-Quran
                Al-Kareem, Al-Ketab, Al-Furqan, Al-Maw'itha, Al-Thikr, and Al-Noor.
              </span>
            </p>
            <p className="mb-0">
              © 2020{' '}
              <Link href="https://quran.com" passHref>
                <StyledLink>Quran.com</StyledLink>
              </Link>
              .<span className="en">All Rights Reserved</span>
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  </FooterContainer>
);

export default Footer;

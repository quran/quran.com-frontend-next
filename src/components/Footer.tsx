import React from "react";
import { Container, Row, Col } from "styled-bootstrap-grid";
import styled from "styled-components";

const FooterContainer = styled.footer`
  float: left;
  width: 100%;
  background: #eee;
  font-size: 14px;
  color: #8a8a8a;
  padding: 30px 20px;
`;

const FooterTab = styled.div`
  float: left;
  width: 100%;
  margin-bottom: 20px;
`;

const Title = styled.h4`
  font-size: 20px;
`;

const List = styled.li`
  margin: 5px 0;
`;

const Copyright = styled(Col)`
  margin-left: auto;
`;

const Content = styled.p`
  margin-bottom: 1.5rem;
`;

const Footer = () => (
  <FooterContainer>
    <Container>
      <Row>
        <Col lg={2} md={3} sm={6}>
          <FooterTab>
            <Title>
              <span className="en">Navigate</span>
            </Title>
            <ul>
              <List>
                <a href="/pages/apps">
                  <span className="en">Download</span>
                </a>
              </List>
              <List>
                <a href="/pages/about_us">
                  <span className="en">About us</span>
                </a>
              </List>
              <List>
                <a href="/pages/donations">
                  <span className="en">Contribute</span>
                </a>
              </List>
              <List>
                <a href="/pages/help_and_feedback">
                  <span className="en">Help & feedback</span>
                </a>
              </List>
              <List>
                <a href="/pages/developers">
                  <span className="en">Developers</span>
                </a>
              </List>
            </ul>
          </FooterTab>
        </Col>
        <Col lg={2} md={3} sm={6}>
          <FooterTab>
            <Title>
              <span className="en">Useful sites</span>
            </Title>
            <ul>
              <List>
                <a
                  href="https://quranicaudio.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Quraninaudio.com
                </a>
              </List>
              <List>
                <a
                  href="https://sunnah.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Salah.com
                </a>
              </List>
              <List>
                <a
                  href="https://legacy.quran.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {" "}
                  Legacy Quran.com
                </a>
              </List>
              <List>
                <a
                  href="https://corpus.quran.com/wordbyword.jsp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Corpus.Quran.com
                </a>
              </List>
            </ul>
          </FooterTab>
        </Col>
        <Col lg={2} md={3} sm={6}>
          <FooterTab>
            <Title>
              <span className="en">Other links</span>
            </Title>
            <ul>
              <List>
                <a
                  href="https://quran.com/sitemap.xml.gz"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Sitemap
                </a>
              </List>
              <List>
                <a
                  href="https://quran.com/36"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Surah Yaseen (يس)
                </a>
              </List>
              <List>
                <a
                  href="https://quran.com/2/255"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ayat Al-Kursi (آية الكرسي)
                </a>
              </List>
            </ul>
          </FooterTab>
        </Col>
        <Copyright lg={4} md={6} sm={12}>
          <div className="copyright">
            <Content>
              <span className="en">
                Quran.com is a Sadaqah Jariyah. We hope to make it easy for
                everyone to read, study, and learn The Noble Quran. The Noble
                Quran has many names including Al-Quran Al-Kareem, Al-Ketab,
                Al-Furqan, Al-Maw&apos;itha, Al-Thikr, and Al-Noor.
              </span>
            </Content>
            <p>
              &copy; 2020 <a href="quran.com">Quran.com</a>.{" "}
              <span className="en">All Rights Reserved</span>
            </p>
          </div>
        </Copyright>
      </Row>
    </Container>
  </FooterContainer>
);

export default Footer;

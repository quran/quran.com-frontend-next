import React from 'react';
import { Container, Row, Col } from 'styled-bootstrap-grid';
import styled from 'styled-components';
import Text from './dls/Text/Text';
import Anchor from './Anchor/Anchor';

const FooterContainer = styled.footer`
  float: left;
  width: 100%;
  background: ${({ theme }) => theme.colors.grey.grey1};
  font-size: ${({ theme }) => theme.fontSizes[2]};
  color: ${({ theme }) => theme.colors.grey.grey2};
  padding-top: 1.875rem;
  padding-bottom: 1.875rem;
  padding-left: 1.25rem;
  padding-right: 1.25rem;
`;

const FooterTab = styled.div`
  float: left;
  width: 100%;
  margin-bottom: 1.25rem;
`;

const List = styled.li`
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
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
            <Text primary large>
              Navigate
            </Text>
            <ul>
              <List>
                <Anchor href="/pages/apps">Download</Anchor>
              </List>
              <List>
                <Anchor href="/pages/about_us">About us</Anchor>
              </List>
              <List>
                <Anchor href="/pages/donations">Contribute</Anchor>
              </List>
              <List>
                <Anchor href="/pages/help_and_feedback">Help & feedback</Anchor>
              </List>
              <List>
                <Anchor href="/pages/developers">Developers</Anchor>
              </List>
            </ul>
          </FooterTab>
        </Col>
        <Col lg={2} md={3} sm={6}>
          <FooterTab>
            <Text primary large>
              Useful sites
            </Text>
            <ul>
              <List>
                <Anchor href="https://quranicaudio.com/">Quraninaudio.com</Anchor>
              </List>
              <List>
                <Anchor href="https://sunnah.com/">Salah.com</Anchor>
              </List>
              <List>
                <Anchor href="https://legacy.quran.com/">Legacy Quran.com</Anchor>
              </List>
              <List>
                <Anchor href="https://corpus.quran.com/wordbyword.jsp">Corpus.Quran.com</Anchor>
              </List>
            </ul>
          </FooterTab>
        </Col>
        <Col lg={2} md={3} sm={6}>
          <FooterTab>
            <Text primary large>
              Other links
            </Text>
            <ul>
              <List>
                <Anchor href="https://quran.com/sitemap.xml.gz">Sitemap</Anchor>
              </List>
              <List>
                <Anchor href="https://quran.com/36">Surah Yaseen (يس)</Anchor>
              </List>
              <List>
                <Anchor href="https://quran.com/2/255">Ayat Al-Kursi (آية الكرسي)</Anchor>
              </List>
            </ul>
          </FooterTab>
        </Col>
        <Copyright lg={4} md={6} sm={12}>
          <Content>
            Quran.com is a Sadaqah Jariyah. We hope to make it easy for everyone to read, study, and
            learn The Noble Quran. The Noble Quran has many names including Al-Quran Al-Kareem,
            Al-Ketab, Al-Furqan, Al-Maw&apos;itha, Al-Thikr, and Al-Noor.
          </Content>
          <Content>
            &copy; 2020 <Anchor href="quran.com">Quran.com</Anchor>. All Rights Reserved
          </Content>
        </Copyright>
      </Row>
    </Container>
  </FooterContainer>
);

export default Footer;

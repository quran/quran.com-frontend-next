import React from 'react';
import styled from 'styled-components';
import { Container, Col } from 'styled-bootstrap-grid';
import phones from '../../../../public/images/mockup-mobilex2.png';
import DownloadAppButton from './DownloadAppButton';

const Row = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  margin-right: -0.75rem;
  margin-left: -0.75rem;
`;
const Title = styled.h1`
  font-family: SFProText-Bold;
  font-size: 30px;
  color: #00acc1;
  margin-bottom: 0.93rem;
  line-height: 1.57;
`;
const Content = styled.p`
  font-family: SFProText-Medium;
  font-size: 16px;
  line-height: 1.47;
  color: #8a8a8a;
  margin-bottom: 1rem;
`;
type AppPageProps = {
  title: string;
  content: string;
};

const AppsPage = ({ title, content }: AppPageProps) => {
  return (
    <Container>
      <Row>
        <Col md={5}>
          <Title>{title}</Title>
          <Content>{content}</Content>
          <DownloadAppButton
            url="https://apps.apple.com/us/app/quran-by-quran-com-qran/id1118663303"
            src="https://cdn.qurancdn.com/packs/media/images/app-store-18811f2037bd0c87bd0990568cca96aa.png"
            alt="Quran.com mobile apps"
            width="130px"
            height="40px"
          />
          <DownloadAppButton
            url="https://play.google.com/store/apps/details?id=com.quran.labs.androidquran&utm_source=quran-com&utm_campaign=download"
            src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
            alt="Get Quran.com app on Google Play"
            width="150px"
            height="auto"
          />
        </Col>
        <Col md={6}>
          <img src={phones} alt="Quran.com mobile apps" />
        </Col>
      </Row>
    </Container>
  );
};

export default AppsPage;

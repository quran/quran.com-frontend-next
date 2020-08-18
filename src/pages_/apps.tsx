import React from 'react';
import { Container, Row, Col } from 'styled-bootstrap-grid';
import useTranslation from 'next-translate/useTranslation';
import DownloadApp from '../components/Pages/QuranApps/DownloadApp';
import Text from '../components/dls/Text/Text';
import phones from '../../public/images/mockup-mobilex2.png';

const Apps = () => {
  const { t } = useTranslation();
  const quranCom = t('common:Quran-com');
  const description = t('apps:description');

  return (
    <Container>
      <Row>
        <Col md={6}>
          <Text large primary>
            {quranCom}
          </Text>
          <Text>{description}</Text>
          <a href="https://play.google.com/store/apps/details?id=com.quran.labs.androidquran&hl=en">
            <DownloadApp
              src="https://cdn.qurancdn.com/packs/media/images/app-store-18811f2037bd0c87bd0990568cca96aa.png"
              alt="Download this app"
            />
          </a>
          <a href="https://play.google.com/store/apps/details?id=com.quran.labs.androidquran&hl=en">
            <DownloadApp
              src="https://cdn.qurancdn.com/packs/media/images/app-store-18811f2037bd0c87bd0990568cca96aa.png"
              alt="Download this app"
            />
          </a>
        </Col>
        <Col md={6}>
          <img src={phones} alt="Quran.com mobile apps" />
        </Col>
      </Row>
    </Container>
  );
};

export default Apps;

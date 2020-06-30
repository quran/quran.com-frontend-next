import React from 'react';
import { Container, Row, Col } from 'styled-bootstrap-grid';
import useTranslation from 'next-translate/useTranslation';
import Text from '../components/dls/Text/Text';

const About = () => {
  const { t } = useTranslation();
  const quranCom = t('common:Quran-com');
  const description = t('about:description');

  return (
    <Container>
      <Row>
        <Col xs={12}>
          <Text large primary>
            {quranCom}
          </Text>
          <Text>{description}</Text>
        </Col>
      </Row>
    </Container>
  );
};

export default About;

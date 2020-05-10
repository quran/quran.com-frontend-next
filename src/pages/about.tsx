import React from 'react';
import { Container, Row, Col } from 'styled-bootstrap-grid';
import Text from '../components/dls/Text/Text';

const About = () => (
  <Container>
    <Row>
      <Col xs={12}>
        <Text large primary>
          Quran.com
        </Text>
        <Text>
          The Noble Quran is the central religious text of Islam. Muslims believe the Qur’an is the
          book of Divine guidance and direction for mankind, and consider the original Arabic text
          the final revelation of Allah (God).[1] All translations of the original Arabic text are
          thus interpretations of the original meanings and should be embraced as such. For more
          information about the Noble Quran, you may visit its Wikipedia article.
        </Text>
      </Col>
    </Row>
  </Container>
);

export default About;

import React from 'react';
import styled from 'styled-components';
import { Container, Row, Col } from 'styled-bootstrap-grid';
import Navbar from '../components/Navbar';
import mock from '../../tests/mock';
import Link from '../components/Link';
import Tabs, { Tab } from '../components/Tabs';

const GrayContainer = styled.div`
  min-height: 100vh;
`;

const Time = styled.p`
  font-family: Maison Neue;
  font-style: normal;
  font-weight: bold;
  font-size: 12px;
  line-height: 20px;
  letter-spacing: 0.06em;
  color: #222222;
  margin-bottom: 1.25rem;
  margin-top: 2rem;
`;

const Title1 = styled.h2`
  font-family: Schear Grotesk;
  font-style: normal;
  font-weight: bold;
  font-size: 56px;
  line-height: 48px;
  text-transform: uppercase;
  color: #222222;
  margin-bottom: 1rem;
`;

const Description = styled.p`
  font-family: Maison Neue;
  font-style: normal;
  font-weight: 500;
  font-size: 1rem;
  line-height: 20px;
  color: #222222;
  margin-bottom: 1rem;
`;

const Red = styled.span`
  color: #e50000;
`;

const Divider = styled.hr`
  margin-top: 4rem;
  opacity: 0.1;
`;

const Index = () => (
  <GrayContainer>
    <Navbar />
    <Container>
      <Tabs defaultKey="upcoming">
        <Tab label="Upcoming" key="upcoming">
          <Row>
            {mock.map((item, index) => (
              <Col xl="4" xs="12" key={item.id}>
                {index > 2 && <Divider />}
                <Time>
                  {item.timeStart} - {item.timeEnd}
                </Time>
                <Title1>{item.title}</Title1>
                <Description>{item.description}</Description>
                <Description>
                  <Link>RSVP</Link>· Hosted by <Red>{item.host}</Red>
                </Description>
              </Col>
            ))}
          </Row>
        </Tab>
        <Tab label="Recent" key="recent">
          <Row>
            {mock.map((item, index) => (
              <Col xl="4" xs="12" key={item.id}>
                {index > 2 && <Divider />}
                <Time>
                  {item.timeStart} - {item.timeEnd}
                </Time>
                <Title1>{item.title}</Title1>
                <Description>{item.description}</Description>
                <Description>
                  <Link>RSVP</Link>· Hosted by <Red>{item.host}</Red>
                </Description>
              </Col>
            ))}
          </Row>
        </Tab>
      </Tabs>
    </Container>
  </GrayContainer>
);

export default Index;

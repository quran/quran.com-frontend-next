import React from 'react';
import fetch from 'isomorphic-unfetch';
import styled from 'styled-components';
import { Container, Row, Col } from 'styled-bootstrap-grid';
import { DateTime, Interval } from 'luxon';
import { NextPage } from 'next';
import Navbar from '../components/Navbar';
import Link from '../components/Link';
import Tabs, { Tab } from '../components/Tabs';
import { makeUrl } from '../utils/api';
import PostType from '../../types/PostType';

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

const TwitterLink = styled.a`
  color: #e50000;
  text-decoration: none;
`;

const Divider = styled.hr`
  margin-top: 4rem;
  opacity: 0.1;
`;

const Item = ({ item }: { item: PostType }) => (
  <>
    <Time>
      {DateTime.fromISO(item.time_start).toLocaleString(DateTime.TIME_SIMPLE)} -{' '}
      {DateTime.fromISO(item.time_end).toLocaleString(DateTime.TIME_SIMPLE)},{' '}
      {DateTime.fromISO(item.time_start).toLocaleString({
        month: 'short',
        day: '2-digit',
      })}
    </Time>
    <Title1>{item.title}</Title1>
    <Description>{item.description}</Description>
    <Description>
      <Link herf={item.url} target="_blank">
        RSVP
      </Link>
      · Hosted by{' '}
      <TwitterLink href={`https://twitter.com/${item.host_twitter}`} target="_blank">
        {item.host_twitter}
      </TwitterLink>
    </Description>
  </>
);

const Index: NextPage<{ posts: PostType[] }> = ({ posts }) => (
  <GrayContainer>
    <Navbar />
    <Container>
      <Tabs defaultKey="upcoming">
        <Tab label="Upcoming" key="upcoming">
          <Row>
            {posts
              .filter((a) => DateTime.fromISO(a.time_end) > DateTime.fromJSDate(new Date()))
              .sort((a, b) =>
                DateTime.fromISO(a.time_start) > DateTime.fromISO(b.time_start) ? 1 : -1,
              )
              .map((item, index) => (
                <Col xl="4" xs="12" key={item.id}>
                  {index > 2 && <Divider />}
                  <Item item={item} />
                </Col>
              ))}
          </Row>
        </Tab>
        <Tab label="Recent" key="recent">
          <Row>
            {posts
              .sort((a, b) =>
                DateTime.fromISO(a.created_at) > DateTime.fromISO(b.created_at) ? -1 : 1,
              )
              .map((item, index) => (
                <Col xl="4" xs="12" key={item.id}>
                  {index > 2 && <Divider />}
                  <Item item={item} />
                </Col>
              ))}
          </Row>
        </Tab>
      </Tabs>
    </Container>
  </GrayContainer>
);

Index.getInitialProps = async (context) => {
  const response = await fetch(makeUrl('/posts.json'));
  const posts = await response.json();

  return {
    posts,
  };
};

export default Index;

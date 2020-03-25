import React from 'react';
import styled from 'styled-components';
import { Container, Row, Col } from 'styled-bootstrap-grid';
import { DateTime } from 'luxon';
import { NextPage } from 'next';
import { useQuery } from '@apollo/react-hooks';
import Navbar from '../components/Navbar';
import Link from '../components/Link';
import Tabs, { Tab } from '../components/Tabs';
import PostType from '../../types/PostType';
import { withApollo } from '../components/withApollo';
import { POSTS_QUERY } from '../graphql/posts';

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

const Title1 = styled.h2<{ isLive: boolean }>`
  font-family: Schear Grotesk;
  font-style: normal;
  font-weight: bold;
  font-size: 56px;
  line-height: 48px;
  text-transform: uppercase;
  color: ${(props) => (props.isLive ? props.theme.redColor : '#222222')};
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

const RedLink = styled.a`
  color: ${(props) => props.theme.redColor};
  text-decoration: none;
`;

const Divider = styled.hr`
  margin-top: 4rem;
  opacity: 0.1;
`;

const LiveIcon = styled.span`
  height: 8px;
  width: 8px;
  border-radius: 8px;
  background: ${(props) => props.theme.redColor};
  display: inline-block;
`;

const Item = ({ item }: { item: PostType }) => {
  const now = DateTime.fromJSDate(new Date());
  const isLive = DateTime.fromISO(item.time_start) < now && now < DateTime.fromISO(item.time_end);
  console.log(item);

  return (
    <>
      <Time>
        {isLive ? (
          <RedLink>
            <LiveIcon /> Live
          </RedLink>
        ) : (
          <>
            {DateTime.fromISO(item.time_start).toLocaleString(DateTime.TIME_SIMPLE)} -{' '}
            {DateTime.fromISO(item.time_end).toLocaleString(DateTime.TIME_SIMPLE)}
          </>
        )}
        ,{' '}
        {DateTime.fromISO(item.time_start).toLocaleString({
          month: 'short',
          day: '2-digit',
        })}
      </Time>
      <Title1 isLive={isLive}>{item.title}</Title1>
      <Description>{item.description}</Description>
      <Description>
        <Link href={item.url} target="_blank">
          RSVP
        </Link>
      </Description>
    </>
  );
};

const Index: NextPage<{ posts: PostType[] }> = ({ posts = [] }) => {
  const { loading, error, data } = useQuery(POSTS_QUERY);

  return (
    <GrayContainer>
      <Navbar />
      <Container>
        <Tabs defaultKey="upcoming">
          <Tab label="Upcoming" key="upcoming">
            <Row>
              {data?.posts
                ?.filter((a) => DateTime.fromISO(a.time_end) > DateTime.fromJSDate(new Date()))
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
          <Tab label="Recently added" key="recent">
            <Row>
              {data?.posts
                ?.sort((a, b) =>
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
          <Tab label="Previous" key="previous">
            <Row>
              {data?.posts
                ?.filter((a) => DateTime.fromISO(a.time_end) < DateTime.fromJSDate(new Date()))
                ?.sort((a, b) =>
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
};

// Index.getInitialProps = async (context) => {
//   const response = await fetch(makeUrl('/posts.json'));
//   const posts = await response.json();

//   return {
//     posts,
//   };
// };

export default withApollo({ ssr: false })(Index);

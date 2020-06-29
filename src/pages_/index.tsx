import React from 'react';
import { Container, Row } from 'styled-bootstrap-grid';
import { NextPage, GetStaticProps } from 'next';
import ChaptersList from '../components/chapters/ChapterList';
import ChapterType from '../../types/ChapterType';
import CardRow from '../components/dls/Cards/CardRow';
import Card from '../components/dls/Cards/Card';
import { getChapters } from '../api';
import sunnahImage from '../../public/images/sunnah.png';
import salahImage from '../../public/images/salah.jpg';
import qaudioImage from '../../public/images/qaudio.jpeg';

type IndexProps = {
  chaptersResponse: {
    chapters: ChapterType[];
  };
};

const Index: NextPage<IndexProps> = ({ chaptersResponse: { chapters } }) => {
  return (
    <Container>
      <Row>
        <CardRow mb={2}>
          <Card title="Salah" subtitle="Search prayer time for any location" image={salahImage} />
          <Card
            title="Sunnah"
            subtitle="The Hadith of Prophet Muhammad(PBUH)"
            image={sunnahImage}
          />
          <Card
            title="Noble Quran in audio"
            subtitle="Learning & listening at the same time"
            image={qaudioImage}
          />
        </CardRow>
        <ChaptersList chapters={chapters.slice(0, 38)} />
        <ChaptersList chapters={chapters.slice(38, 76)} />
        <ChaptersList chapters={chapters.slice(76, 114)} />
      </Row>
    </Container>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const chaptersResponse = await getChapters();

  return {
    props: { chaptersResponse },
  };
};

export default Index;

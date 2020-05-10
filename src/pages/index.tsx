import React from 'react';
import { Container, Row } from 'styled-bootstrap-grid';
import { NextPage, GetStaticProps } from 'next';
import ChaptersList from '../components/chapters/ChapterList';
import ChapterType from '../../types/ChapterType';
import CardRow from '../components/dls/Cards/CardRow';
import Card from '../components/dls/Cards/Card';
import { getChapters } from '../api';

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
          <Card
            title="Salah"
            subtitle="Search prayer time for any location"
            image="https://cdn.qurancdn.com/packs/media/images/salah-935518782bf136f39dc70621fd40ea31.jpg"
          />
          <Card
            title="Sunnah"
            subtitle="The Hadith of Prophet Muhammad(PBUH)"
            image="https://cdn.qurancdn.com/packs/media/images/sunnah-d502b874bd3d2334924e68707f8dda79.png"
          />
          <Card
            title="Noble Quran in audio"
            subtitle="Learning & listening at the same time"
            image="https://cdn.qurancdn.com/packs/media/images/audio-0680e4f9fac1d663f0e286459461e08d.png"
          />
        </CardRow>
        <ChaptersList chapters={chapters.slice(0, 38)} />
        <ChaptersList chapters={chapters.slice(38, 76)} />
        <ChaptersList chapters={chapters.slice(76, 114)} />
      </Row>
    </Container>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const chaptersResponse = await getChapters();

  return {
    props: { chaptersResponse },
  };
};

export default Index;

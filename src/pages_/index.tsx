import React from 'react';
import { Container, Row } from 'styled-bootstrap-grid';
import { NextPage, GetStaticProps } from 'next';
import useTranslation from 'next-translate/useTranslation';
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
  const { t } = useTranslation();
  const salah = t('common:Salah');
  const salahSubtitle = t('home:salahSubtitle');
  const sunnah = t('common:Sunnah');
  const sunnahSubtitle = t('home:sunnahSubtitle');
  const quranAudio = t('home:quranAudio');
  const quranAudioSubtitle = t('home:quranAudioSubtitle');

  return (
    <Container>
      <Row>
        <CardRow mb={2}>
          <Card title={salah} subtitle={salahSubtitle} image={salahImage} />
          <Card title={sunnah} subtitle={sunnahSubtitle} image={sunnahImage} />
          <Card title={quranAudio} subtitle={quranAudioSubtitle} image={qaudioImage} />
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

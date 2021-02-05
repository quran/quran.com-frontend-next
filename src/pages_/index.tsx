import React from 'react';
import { Container, Row } from 'styled-bootstrap-grid';
import { NextPage, GetStaticProps } from 'next';
import useTranslation from 'next-translate/useTranslation';
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
  const { t } = useTranslation();
  const salah = t('common:Salah');
  const salahSubtitle = t('home:salahSubtitle');
  const sunnah = t('common:Sunnah');
  const sunnahSubtitle = t('home:sunnahSubtitle');
  const quranAudio = t('home:quranAudio');
  const quranAudioSubtitle = t('home:quranAudioSubtitle');

  return (
    <Container style={{ paddingTop: '4rem' }}>
      <Row>
        <CardRow mb={2}>
          <Card title={salah} subtitle={salahSubtitle} image="/images/sunnah.png" />
          <Card title={sunnah} subtitle={sunnahSubtitle} image="/images/sunnah.png" />
          <Card title={quranAudio} subtitle={quranAudioSubtitle} image="/images/qaudio.jpeg" />
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

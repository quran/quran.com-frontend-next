/* eslint-disable i18next/no-literal-string */
/* eslint-disable react/no-multi-comp */

import classNames from 'classnames';
import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import useTranslation from 'next-translate/useTranslation';

import styles from './index.module.scss';

import ChapterAndJuzListWrapper from '@/components/chapters/ChapterAndJuzList';
import HomePageHero from '@/components/HomePage/HomePageHero';
import QuranGrowthJourneySection from '@/components/HomePage/QuranGrowthJourneySection';
import RamadanActivitiesSection from '@/components/HomePage/RamadanActivitiesSection';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import BookmarksAndCollectionsSection from '@/components/Verses/BookmarksAndCollectionsSection';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl } from '@/utils/navigation';
import { ChaptersResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';

type IndexProps = {
  chaptersResponse: ChaptersResponse;
  chaptersData: ChaptersData;
  country?: string;
};

export const getServerSideProps: GetServerSideProps = async ({ locale, query }) => {
  const allChaptersData = await getAllChaptersData(locale);

  return {
    props: {
      country: query.country,
      chaptersData: allChaptersData,
      chaptersResponse: {
        chapters: Object.keys(allChaptersData).map((chapterId) => {
          const chapterData = allChaptersData[chapterId];
          return { ...chapterData, id: Number(chapterId) };
        }),
      },
    },
  };
};

const Index: NextPage<IndexProps> = ({ chaptersResponse: { chapters }, country }): JSX.Element => {
  const { t, lang } = useTranslation('home');

  return (
    <>
      <Head>
        <link rel="preload" as="image" href="/images/background.jpg" crossOrigin="anonymous" />
      </Head>
      <NextSeoWrapper
        title={t('home:noble-quran')}
        url={getCanonicalUrl(lang, '')}
        languageAlternates={getLanguageAlternates('')}
      />
      <div className={styles.pageContainer}>
        <div className={styles.flow}>
          {country ? <p>{country}</p> : <p>No country detected</p>}

          <HomePageHero />
          <div className={classNames(styles.flowItem, styles.fullWidth)}>
            <RamadanActivitiesSection />
          </div>
          <div className={classNames(styles.flowItem, styles.fullWidth)}>
            <QuranGrowthJourneySection />
          </div>
          <div className={classNames(styles.flowItem, styles.fullWidth)}>
            <BookmarksAndCollectionsSection isHomepage />
          </div>
          <div className={styles.flowItem}>
            <ChapterAndJuzListWrapper chapters={chapters} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;

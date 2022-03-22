/* eslint-disable react-func/max-lines-per-function */
import React from 'react';

import { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import useTranslation from 'next-translate/useTranslation';

import styles from './[verseId]/tafsirs.module.scss';

import { getVerseReflections } from 'src/api';
import NextSeoWrapper from 'src/components/NextSeoWrapper';
import ReflectionBodyContainer from 'src/components/QuranReader/ReflectionView/ReflectionBodyContainer';
import DataContext from 'src/contexts/DataContext';
import Error from 'src/pages/_error';
import {
  getQuranReaderStylesInitialState,
  getTranslationsInitialState,
} from 'src/redux/defaultSettings/util';
import { getChapterData, getAllChaptersData } from 'src/utils/chapter';
import { getLanguageAlternates, toLocalizedNumber } from 'src/utils/locale';
import {
  getCanonicalUrl,
  getVerseReflectionNavigationUrl,
  scrollWindowToTop,
} from 'src/utils/navigation';
import {
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
} from 'src/utils/staticPageGeneration';
import { isValidVerseKey } from 'src/utils/validator';
import { getVerseAndChapterNumbersFromKey } from 'src/utils/verse';
import { ChapterResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';

type AyahReflectionProp = {
  chapter?: ChapterResponse;
  hasError?: boolean;
  verseNumber?: string;
  chapterId?: string;
  initialData?: any;
  chaptersData: ChaptersData;
};

const SelectedAyahReflection: NextPage<AyahReflectionProp> = ({
  hasError,
  chapter,
  verseNumber,
  chapterId,
  initialData,
  chaptersData,
}) => {
  const { t, lang } = useTranslation('quran-reader');
  if (hasError) {
    return <Error statusCode={500} />;
  }

  const navigationUrl = getVerseReflectionNavigationUrl(`${chapterId}:${verseNumber}`);

  return (
    <DataContext.Provider value={chaptersData}>
      <NextSeoWrapper
        title={`${t('common:reflect')} ${chapter.chapter.transliteratedName} - ${toLocalizedNumber(
          Number(verseNumber),
          lang,
        )}`}
        canonical={getCanonicalUrl(lang, navigationUrl)}
        languageAlternates={getLanguageAlternates(navigationUrl)}
        description={t('reflections-desc', {
          ayahNumber: verseNumber,
          surahName: chapter.chapter.transliteratedName,
        })}
      />
      <div className={styles.tafsirContainer}>
        <ReflectionBodyContainer
          scrollToTop={scrollWindowToTop}
          initialChapterId={chapterId}
          initialVerseNumber={verseNumber.toString()}
          initialData={initialData}
          render={({ body, surahAndAyahSelection }) => {
            return (
              <div>
                {surahAndAyahSelection}
                {body}
              </div>
            );
          }}
        />
      </div>
    </DataContext.Provider>
  );
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const { chapterId } = params;
  const verseKey = String(chapterId);
  const chaptersData = await getAllChaptersData(locale);
  if (!isValidVerseKey(chaptersData, verseKey)) {
    return { notFound: true };
  }
  const [chapterNumber, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
  const { quranFont, mushafLines } = getQuranReaderStylesInitialState(locale);
  try {
    const data = await getVerseReflections({
      chapterId: chapterNumber,
      mushafLines,
      quranFont,
      translation: getTranslationsInitialState(locale).selectedTranslations,
      verseNumber,
    });
    return {
      props: {
        chaptersData,
        chapterId: chapterNumber,
        chapter: { chapter: getChapterData(chaptersData, chapterNumber) },
        verseNumber,
        initialData: data,
      },
      revalidate: ONE_WEEK_REVALIDATION_PERIOD_SECONDS, // verses will be generated at runtime if not found in the cache, then cached for subsequent requests for 7 days.
    };
  } catch (error) {
    return {
      props: { hasError: true },
      revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS, // 35 seconds will be enough time before we re-try generating the page again.
    };
  }
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [], // no pre-rendered chapters at build time.
  fallback: 'blocking', // will server-render pages on-demand if the path doesn't exist.
});

export default SelectedAyahReflection;

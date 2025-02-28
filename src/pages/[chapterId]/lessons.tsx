/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import React from 'react';

import { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { SWRConfig } from 'swr';

import { fetcher } from '@/api';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import ReflectionBodyContainer from '@/components/QuranReader/ReflectionView/ReflectionBodyContainer';
import { getChapterOgImageUrl } from '@/lib/og';
import Error from '@/pages/_error';
import layoutStyle from '@/pages/index.module.scss';
import {
  getQuranReaderStylesInitialState,
  getTranslationsInitialState,
} from '@/redux/defaultSettings/util';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { makeVersesUrl } from '@/utils/apiPaths';
import { getChapterData, getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates, toLocalizedNumber } from '@/utils/locale';
import {
  getCanonicalUrl,
  getVerseLessonNavigationUrl,
  scrollWindowToTop,
} from '@/utils/navigation';
import {
  getAyahReflections,
  makeAyahReflectionsUrl,
  LESSON_POST_TYPE_ID,
} from '@/utils/quranReflect/apiPaths';
import {
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
} from '@/utils/staticPageGeneration';
import { isValidVerseKey } from '@/utils/validator';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';
import { ChapterResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';
import ContentType from 'types/QuranReflect/ContentType';

type AyahLessonProp = {
  chapter?: ChapterResponse;
  hasError?: boolean;
  verseNumber?: string;
  chapterId?: string;
  chaptersData: ChaptersData;
  fallback?: any;
};

const SelectedAyahLesson: NextPage<AyahLessonProp> = ({
  hasError,
  chapter,
  verseNumber,
  chapterId,
  fallback,
}) => {
  const { t, lang } = useTranslation('quran-reader');
  if (hasError) {
    return <Error statusCode={500} />;
  }

  const navigationUrl = getVerseLessonNavigationUrl(`${chapterId}:${verseNumber}`);
  return (
    <>
      <NextSeoWrapper
        title={`${chapter.chapter.transliteratedName} - ${toLocalizedNumber(
          Number(verseNumber),
          lang,
        )} ${t('common:lessons')}`}
        image={getChapterOgImageUrl({
          chapterId,
          verseNumber,
          locale: lang,
        })}
        imageWidth={1200}
        imageHeight={630}
        canonical={getCanonicalUrl(lang, navigationUrl)}
        languageAlternates={getLanguageAlternates(navigationUrl)}
        description={t('lessons-desc', {
          ayahNumber: verseNumber,
          surahName: chapter.chapter.transliteratedName,
        })}
      />
      {/* @ts-ignore */}
      <SWRConfig value={{ fallback }}>
        <div className={layoutStyle.pageContainer}>
          <div className={layoutStyle.flow}>
            <div className={layoutStyle.flowItem}>
              <ReflectionBodyContainer
                scrollToTop={scrollWindowToTop}
                initialChapterId={chapterId}
                initialVerseNumber={verseNumber.toString()}
                initialContentType={ContentType.LESSONS}
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
          </div>
        </div>
      </SWRConfig>
    </>
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
  const translations = getTranslationsInitialState(locale).selectedTranslations;
  try {
    const verseLessonsUrl = makeAyahReflectionsUrl({
      surahId: chapterNumber,
      ayahNumber: verseNumber,
      locale,
      reviewed: true,
      postTypeIds: [LESSON_POST_TYPE_ID],
    });

    const mushafId = getMushafId(quranFont, mushafLines).mushaf;
    const apiParams = {
      ...getDefaultWordFields(quranFont),
      translationFields: 'resource_name,language_id',
      translations: translations.join(','),
      mushaf: mushafId,
      from: `${chapterNumber}:${verseNumber}`,
      to: `${chapterNumber}:${verseNumber}`,
    };

    const versesUrl = makeVersesUrl(chapterNumber, locale, apiParams);

    const [verseLessonsData, versesData] = await Promise.all([
      getAyahReflections(verseLessonsUrl),
      fetcher(versesUrl),
    ]);

    const fallback = {
      [verseLessonsUrl]: verseLessonsData,
      [versesUrl]: versesData,
    };

    return {
      props: {
        chaptersData,
        chapterId: chapterNumber,
        chapter: { chapter: getChapterData(chaptersData, chapterNumber) },
        verseNumber,
        fallback,
      },
      revalidate: ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
    };
  } catch (error) {
    return {
      props: { hasError: true },
      revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS,
    };
  }
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: 'blocking',
});

export default SelectedAyahLesson;

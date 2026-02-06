/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import React from 'react';

import { NextPage, GetServerSideProps } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { SWRConfig } from 'swr';

import { fetcher, getPagesLookup } from '@/api';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import QuranReader from '@/components/QuranReader';
import { StudyModeTabId } from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeBottomActions';
import StudyModeSsrContainer from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeSsrContainer';
import { getChapterOgImageUrl } from '@/lib/og';
import { logErrorToSentry } from '@/lib/sentry';
import {
  getQuranReaderStylesInitialState,
  getTranslationsInitialState,
} from '@/redux/defaultSettings/util';
import { ChapterResponse, VersesResponse, VerseResponse } from '@/types/ApiResponses';
import ChaptersData from '@/types/ChaptersData';
import Language from '@/types/Language';
import AyahQuestionsResponse from '@/types/QuestionsAndAnswers/AyahQuestionsResponse';
import { QuranReaderDataType } from '@/types/QuranReader';
import Verse from '@/types/Verse';
import { getMushafId } from '@/utils/api';
import { getAyahQuestions } from '@/utils/auth/api';
import { getChapterData, getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates, toLocalizedNumber } from '@/utils/locale';
import { getCanonicalUrl, getVerseAnswersNavigationUrl } from '@/utils/navigation';
import { isValidVerseKey } from '@/utils/validator';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';
import { buildVersesResponse, buildStudyModeVerseUrl } from '@/utils/verseKeys';
import withSsrRedux from '@/utils/withSsrRedux';

type SelectedAyahQuestionsPageProps = {
  chapter?: ChapterResponse;
  verseNumber?: string;
  chapterId?: string;
  chaptersData: ChaptersData;
  fallback?: Record<string, unknown>;
  verse?: Verse;
  versesResponse?: VersesResponse;
  initialData?: AyahQuestionsResponse;
};

const SelectedAyahQuestionsPage: NextPage<SelectedAyahQuestionsPageProps> = ({
  chapter,
  verseNumber,
  chapterId,
  fallback,
  verse,
  versesResponse,
  initialData,
}) => {
  const { t, lang } = useTranslation('question');

  const navigationUrl = getVerseAnswersNavigationUrl(`${chapterId}:${verseNumber}`);

  return (
    <>
      <NextSeoWrapper
        title={`${t('q-and-a')}${chapter.chapter.transliteratedName} - ${toLocalizedNumber(
          Number(verseNumber),
          lang,
        )}`}
        image={getChapterOgImageUrl({
          chapterId,
          verseNumber,
          locale: lang,
        })}
        imageWidth={1200}
        imageHeight={630}
        canonical={getCanonicalUrl(lang, navigationUrl)}
        languageAlternates={getLanguageAlternates(navigationUrl)}
        description={t('questions-meta-desc')}
      />
      {/* @ts-ignore */}
      <SWRConfig value={{ fallback }}>
        <StudyModeSsrContainer
          initialTab={StudyModeTabId.ANSWERS}
          chapterId={chapterId}
          verseNumber={verseNumber}
          verse={verse}
          questionsInitialData={initialData}
        />
        {chapter?.chapter?.id && versesResponse && (
          <QuranReader
            initialData={versesResponse}
            id={chapter.chapter.id}
            quranReaderDataType={QuranReaderDataType.Chapter}
          />
        )}
      </SWRConfig>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = withSsrRedux(
  '/[chapterId]/answers',
  async ({ params, locale }) => {
    const { chapterId } = params;
    const verseKey = String(chapterId);
    const chaptersData = await getAllChaptersData(locale);

    if (!isValidVerseKey(chaptersData, verseKey)) {
      return { notFound: true };
    }

    const [chapterNumber, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
    const { quranFont, mushafLines } = getQuranReaderStylesInitialState(locale as Language);
    const translations = getTranslationsInitialState(locale as Language).selectedTranslations;

    try {
      const mushafId = getMushafId(quranFont, mushafLines).mushaf;
      const verseUrl = buildStudyModeVerseUrl(verseKey, quranFont, mushafLines, translations);

      const [verseQuestionsData, verseData, pagesLookupResponse] = await Promise.all([
        getAyahQuestions(verseKey, locale as Language),
        fetcher(verseUrl) as Promise<VerseResponse>,
        getPagesLookup({
          chapterNumber: Number(chapterNumber),
          mushaf: mushafId,
        }),
      ]);

      const versesResponse = buildVersesResponse(chaptersData, pagesLookupResponse);

      const fallback = {
        [verseUrl]: verseData,
      };

      return {
        props: {
          chaptersData,
          chapterId: chapterNumber,
          chapter: {
            chapter: { ...getChapterData(chaptersData, chapterNumber), id: chapterNumber },
          },
          verseNumber,
          initialData: verseQuestionsData,
          fallback,
          verse: verseData.verse,
          versesResponse,
        },
      };
    } catch (error) {
      logErrorToSentry(error, {
        transactionName: 'getServerSideProps-VerseQuestionsPage',
        metadata: {
          chapterIdOrSlug: String(params.chapterId),
          locale,
          verseKey,
          language: locale as Language,
        },
      });
      return {
        notFound: true,
      };
    }
  },
);

export default SelectedAyahQuestionsPage;

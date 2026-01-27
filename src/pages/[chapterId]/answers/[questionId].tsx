/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import React from 'react';

import { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { SWRConfig } from 'swr';

import { fetcher, getPagesLookup } from '@/api';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import QuranReader from '@/components/QuranReader';
import { StudyModeTabId } from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeBottomActions';
import StudyModeSsrContainer from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeSsrContainer';
import { getExploreAnswersOgImageUrl } from '@/lib/og';
import { logErrorToSentry } from '@/lib/sentry';
import {
  getQuranReaderStylesInitialState,
  getTranslationsInitialState,
} from '@/redux/defaultSettings/util';
import { VersesResponse, VerseResponse } from '@/types/ApiResponses';
import ChaptersData from '@/types/ChaptersData';
import Language from '@/types/Language';
import AyahQuestionsResponse from '@/types/QuestionsAndAnswers/AyahQuestionsResponse';
import { Question } from '@/types/QuestionsAndAnswers/Question';
import QuestionResponse from '@/types/QuestionsAndAnswers/QuestionResponse';
import { QuranReaderDataType } from '@/types/QuranReader';
import Verse from '@/types/Verse';
import { getMushafId } from '@/utils/api';
import { getAyahQuestions, getQuestionById } from '@/utils/auth/api';
import { getAllChaptersData, getChapterData } from '@/utils/chapter';
import { getLanguageAlternates, toLocalizedVerseKey } from '@/utils/locale';
import { getCanonicalUrl, getAnswerNavigationUrl } from '@/utils/navigation';
import {
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
} from '@/utils/staticPageGeneration';
import { isValidVerseKey } from '@/utils/validator';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';
import { buildVersesResponse, buildStudyModeVerseUrl } from '@/utils/verseKeys';

type QuestionPageProps = {
  chaptersData: ChaptersData;
  questionData: QuestionResponse;
  questionId: string;
  verseKey: string;
  chapterId: string;
  verseNumber: string;
  fallback?: Record<string, unknown>;
  verse?: Verse;
  versesResponse?: VersesResponse;
  questionsInitialData?: AyahQuestionsResponse;
};

const QuestionPage: NextPage<QuestionPageProps> = ({
  questionData,
  questionId,
  verseKey,
  chapterId,
  verseNumber,
  fallback,
  verse,
  versesResponse,
  questionsInitialData,
}) => {
  const { t, lang } = useTranslation('question');

  const { body, summary } = questionData as Question;
  const navigationUrl = getAnswerNavigationUrl(questionId, verseKey);

  return (
    <>
      <NextSeoWrapper
        title={`${t('quran-reader:q-and-a.quran')} ${toLocalizedVerseKey(
          verseKey,
          lang,
        )} - ${body}`}
        image={getExploreAnswersOgImageUrl({
          locale: lang,
        })}
        imageWidth={1200}
        imageHeight={630}
        canonical={getCanonicalUrl(lang, navigationUrl)}
        languageAlternates={getLanguageAlternates(navigationUrl)}
        description={summary}
      />
      {/* @ts-ignore */}
      <SWRConfig value={{ fallback }}>
        <StudyModeSsrContainer
          initialTab={StudyModeTabId.ANSWERS}
          chapterId={chapterId}
          verseNumber={verseNumber}
          verse={verse}
          questionId={questionId}
          questionsInitialData={questionsInitialData}
        />
        {chapterId && versesResponse && (
          <QuranReader
            initialData={versesResponse}
            id={Number(chapterId)}
            quranReaderDataType={QuranReaderDataType.Chapter}
          />
        )}
      </SWRConfig>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const { chapterId, questionId } = params;
  const chaptersData = await getAllChaptersData(locale);
  const questionIdString = String(questionId);
  const verseKeyString = String(chapterId);

  if (!isValidVerseKey(chaptersData, verseKeyString)) {
    return { notFound: true };
  }

  const [chapterNumber, verseNumber] = getVerseAndChapterNumbersFromKey(verseKeyString);
  const { quranFont, mushafLines } = getQuranReaderStylesInitialState(locale as Language);
  const translations = getTranslationsInitialState(locale as Language).selectedTranslations;

  try {
    const mushafId = getMushafId(quranFont, mushafLines).mushaf;
    const verseUrl = buildStudyModeVerseUrl(verseKeyString, quranFont, mushafLines, translations);

    const [questionData, questionsInitialData, verseData, pagesLookupResponse] = await Promise.all([
      getQuestionById(questionIdString),
      getAyahQuestions(verseKeyString, locale as Language),
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
        questionId: questionIdString,
        chaptersData,
        questionData,
        verseKey: verseKeyString,
        chapterId: chapterNumber,
        verseNumber,
        chapter: { chapter: { ...getChapterData(chaptersData, chapterNumber), id: chapterNumber } },
        fallback,
        verse: verseData.verse,
        versesResponse,
        questionsInitialData,
      },
      revalidate: ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
    };
  } catch (error) {
    logErrorToSentry(error, {
      transactionName: 'getStaticProps-QuestionPage',
      metadata: {
        chapterIdOrSlug: String(params.chapterId),
        questionId: String(params.questionId),
        locale,
      },
    });
    return {
      notFound: true,
      revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS,
    };
  }
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: 'blocking',
});

export default QuestionPage;

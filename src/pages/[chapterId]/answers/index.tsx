/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import React from 'react';

import { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import QuestionsList from '@/components/QuestionAndAnswer/QuestionsList';
import QuestionsPageLayout from '@/components/QuestionAndAnswer/QuestionsPageLayout';
import useQuestionsPagination from '@/hooks/useQuestionsPagination';
import { getChapterOgImageUrl } from '@/lib/og';
import { logErrorToSentry } from '@/lib/sentry';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import Language from '@/types/Language';
import AyahQuestionsResponse from '@/types/QuestionsAndAnswers/AyahQuestionsResponse';
import { getAyahQuestions } from '@/utils/auth/api';
import { getChapterData, getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates, toLocalizedNumber } from '@/utils/locale';
import { getCanonicalUrl, getVerseAnswersNavigationUrl } from '@/utils/navigation';
import {
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
} from '@/utils/staticPageGeneration';
import { isValidVerseKey } from '@/utils/validator';
import { getVerseAndChapterNumbersFromKey, makeVerseKey } from '@/utils/verse';
import { ChapterResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';

type SelectedAyahQuestionsPageProps = {
  chapter?: ChapterResponse;
  verseNumber?: string;
  chapterId?: string;
  chaptersData: ChaptersData;
  initialData?: AyahQuestionsResponse;
};

const SelectedAyahQuestionsPage: NextPage<SelectedAyahQuestionsPageProps> = ({
  chapter,
  verseNumber,
  chapterId,
  initialData,
}) => {
  const { t, lang } = useTranslation('question');
  const quranReaderStyles = useSelector(selectQuranReaderStyles);

  const navigationUrl = getVerseAnswersNavigationUrl(`${chapterId}:${verseNumber}`);
  const verseKey = makeVerseKey(Number(chapterId), Number(verseNumber));

  const { questions, hasMore, isLoadingMore, loadMore } = useQuestionsPagination({
    verseKey,
    initialData,
    language: lang as Language,
  });

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
      <PageContainer>
        <QuestionsPageLayout
          chapterId={chapterId}
          verseNumber={verseNumber}
          fontScale={quranReaderStyles.qnaFontScale}
        >
          <QuestionsList
            questions={questions}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={loadMore}
            baseUrl={navigationUrl}
          />
        </QuestionsPageLayout>
      </PageContainer>
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

  try {
    const verseQuestionsData = await getAyahQuestions(verseKey, locale as Language);

    return {
      props: {
        chaptersData,
        chapterId: chapterNumber,
        chapter: { chapter: getChapterData(chaptersData, chapterNumber) },
        verseNumber,
        initialData: verseQuestionsData,
      },
      revalidate: ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
    };
  } catch (error) {
    logErrorToSentry(error, {
      transactionName: 'getStaticProps-VerseQuestionsPage',
      metadata: {
        chapterIdOrSlug: String(params.chapterId),
        locale,
        verseKey,
      },
    });
    return {
      notFound: true,
      revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS,
    };
  }
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [], // no pre-rendered chapters at build time.
  fallback: 'blocking', // will server-render pages on-demand if the path doesn't exist.
});

export default SelectedAyahQuestionsPage;

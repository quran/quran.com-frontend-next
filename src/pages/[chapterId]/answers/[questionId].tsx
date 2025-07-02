/* eslint-disable react-func/max-lines-per-function */
import React from 'react';

import classNames from 'classnames';
import { NextPage, GetServerSideProps } from 'next';
import useTranslation from 'next-translate/useTranslation';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import Answer from '@/components/QuestionAndAnswer/Answer';
import QuestionHeader from '@/components/QuestionAndAnswer/QuestionHeader';
import { getExploreAnswersOgImageUrl } from '@/lib/og';
import { logErrorToSentry } from '@/lib/sentry';
import styles from '@/pages/[chapterId]/answers/questions.module.scss';
import contentPageStyles from '@/pages/contentPage.module.scss';
import { Question } from '@/types/QuestionsAndAnswers/Question';
import QuestionResponse from '@/types/QuestionsAndAnswers/QuestionResponse';
import { getQuestionById } from '@/utils/auth/api';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates, toLocalizedVerseKey } from '@/utils/locale';
import { getCanonicalUrl, getAnswerNavigationUrl } from '@/utils/navigation';
import { isValidVerseKey } from '@/utils/validator';
import withSsrRedux from '@/utils/withSsrRedux';
import ChaptersData from 'types/ChaptersData';

type QuestionPageProps = {
  chaptersData: ChaptersData;
  questionData: QuestionResponse;
  questionId: string;
  verseKey: string;
};

/**
 * Question page component that displays a question and its answer
 * with the new URL format: /{verseKey}/answers/{questionId}
 * @returns {JSX.Element} The rendered question page
 */
const QuestionPage: NextPage<QuestionPageProps> = ({ questionData, questionId, verseKey }) => {
  const { t, lang } = useTranslation('question');

  const { type, theme: themes, body, summary } = questionData as Question;
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
      <PageContainer>
        <div className={classNames(contentPageStyles.contentPage, styles.contentPage)}>
          <QuestionHeader isPage body={body} theme={themes} type={type} />
          <Answer question={questionData} />
        </div>
      </PageContainer>
    </>
  );
};

/**
 * Get server side props for the question page
 * @param {object} context - The context object
 * @param {object} context.params - The route parameters
 * @param {string} context.locale - The current locale
 * @returns {Promise<object>} The props for the question page
 */
export const getServerSideProps: GetServerSideProps = withSsrRedux(
  '/[chapterId]/answers/[questionId]',
  async (context) => {
    const { params, locale } = context;
    const { chapterId, questionId } = params;
    const chaptersData = await getAllChaptersData(locale);
    const questionIdString = String(questionId);
    const verseKeyString = String(chapterId);

    // Validate the verse key
    if (!isValidVerseKey(chaptersData, verseKeyString)) {
      return { notFound: true };
    }

    try {
      const questionData = await getQuestionById(questionIdString);

      return {
        props: {
          questionId: questionIdString,
          chaptersData,
          questionData,
          verseKey: verseKeyString,
        },
      };
    } catch (error) {
      logErrorToSentry(error, {
        transactionName: 'getServerSideProps-QuestionPage',
        metadata: {
          chapterIdOrSlug: String(params.chapterId),
          questionId: String(params.questionId),
          locale,
        },
      });
      return { notFound: true };
    }
  },
);

export default QuestionPage;

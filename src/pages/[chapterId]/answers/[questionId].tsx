import React from 'react';

import classNames from 'classnames';
import { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import useTranslation from 'next-translate/useTranslation';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import Answer from '@/components/QuestionAndAnswer/Answer';
import QuestionHeader from '@/components/QuestionAndAnswer/QuestionHeader';
import { getExploreAnswersOgImageUrl } from '@/lib/og';
import styles from '@/pages/[chapterId]/answers/questions.module.scss';
import Error from '@/pages/_error';
import contentPageStyles from '@/pages/contentPage.module.scss';
import { Question } from '@/types/QuestionsAndAnswers/Question';
import QuestionResponse from '@/types/QuestionsAndAnswers/QuestionResponse';
import { getQuestionById } from '@/utils/auth/api';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getAnswerNavigationUrl } from '@/utils/navigation';
import {
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
} from '@/utils/staticPageGeneration';
import { isValidVerseKey } from '@/utils/validator';
import ChaptersData from 'types/ChaptersData';
import { toLocalizedVerseKey } from '@/utils/locale';

type QuestionPageProps = {
  hasError?: boolean;
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
const QuestionPage: NextPage<QuestionPageProps> = ({
  hasError,
  questionId,
  questionData,
  verseKey,
}) => {
  const { t, lang } = useTranslation('question');

  if (hasError) {
    return <Error statusCode={500} />;
  }

  const { type, theme: themes, body, summary } = questionData as Question;
  const navigationUrl = getAnswerNavigationUrl(questionId, verseKey);

  return (
    <>
      <NextSeoWrapper
        title={`${t('quran-reader:q-and-a.quran')} ${toLocalizedVerseKey(verseKey, lang)} - ${body}`}
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
 * Get static props for the question page
 * @param {object} context - The context object
 * @param {object} context.params - The route parameters
 * @param {string} context.locale - The current locale
 * @returns {Promise<object>} The props for the question page
 */
export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const { chapterId, questionId } = params;
  const chaptersData = await getAllChaptersData(locale);
  const questionIdString = String(questionId);
  const verseKeyString = String(chapterId);

  // Validate the verse key
  if (!isValidVerseKey(chaptersData, verseKeyString)) {
    return {
      notFound: true,
    };
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
      revalidate: ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
    };
  } catch (error) {
    return {
      props: { hasError: true },
      revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS,
    };
  }
};

/**
 * Get static paths for the question page
 * @returns {object} Empty paths array with blocking fallback
 */
export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [], // no pre-rendered pages at build time
  fallback: 'blocking', // will server-render pages on-demand if the path doesn't exist
});

export default QuestionPage;

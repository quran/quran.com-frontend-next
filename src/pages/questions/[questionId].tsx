import React from 'react';

import classNames from 'classnames';
import { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import useTranslation from 'next-translate/useTranslation';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import Answer from '@/components/QuestionAndAnswer/Answer';
import QuestionHeader from '@/components/QuestionAndAnswer/QuestionHeader';
import { getExploreAnswersOgImageUrl } from '@/lib/og';
import Error from '@/pages/_error';
import contentPageStyles from '@/pages/contentPage.module.scss';
import styles from '@/pages/questions/questions.module.scss';
import { Question } from '@/types/QuestionsAndAnswers/Question';
import QuestionResponse from '@/types/QuestionsAndAnswers/QuestionResponse';
import { getQuestionById } from '@/utils/auth/api';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getQuestionNavigationUrl } from '@/utils/navigation';
import {
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
} from '@/utils/staticPageGeneration';
import ChaptersData from 'types/ChaptersData';

type QuestionPageProps = {
  hasError?: boolean;
  chaptersData: ChaptersData;
  questionData: QuestionResponse;
  questionId: string;
};

const QuestionPage: NextPage<QuestionPageProps> = ({ hasError, questionId, questionData }) => {
  const { t, lang } = useTranslation('question');
  if (hasError) {
    return <Error statusCode={500} />;
  }
  const { type, theme: themes, body } = questionData as Question;

  const navigationUrl = getQuestionNavigationUrl(questionId);

  return (
    <>
      <NextSeoWrapper
        title={t('quran-reader:q-and-a.explore_answers')}
        image={getExploreAnswersOgImageUrl({
          locale: lang,
        })}
        imageWidth={1200}
        imageHeight={630}
        canonical={getCanonicalUrl(lang, navigationUrl)}
        languageAlternates={getLanguageAlternates(navigationUrl)}
        description={t('questions-meta-desc')}
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

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const { questionId } = params;
  const chaptersData = await getAllChaptersData(locale);
  const questionIdString = String(questionId);
  try {
    const questionData = await getQuestionById(questionIdString);

    return {
      props: {
        questionId,
        chaptersData,
        questionData,
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

export default QuestionPage;

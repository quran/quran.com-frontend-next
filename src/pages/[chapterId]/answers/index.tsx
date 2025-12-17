/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import React from 'react';

import { NextPage, GetServerSideProps } from 'next';
import useTranslation from 'next-translate/useTranslation';

import { fetcher } from '@/api';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import QuestionsBodyContainer from '@/components/QuestionAndAnswer/QuestionsBodyContainer';
import { getChapterOgImageUrl } from '@/lib/og';
import { logErrorToSentry } from '@/lib/sentry';
import layoutStyle from '@/pages/index.module.scss';
import {
  getQuranReaderStylesInitialState,
  getTranslationsInitialState,
} from '@/redux/defaultSettings/util';
import Language from '@/types/Language';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { makeVersesUrl } from '@/utils/apiPaths';
import { getAyahQuestions } from '@/utils/auth/api';
import { makeGetQuestionsByVerseKeyUrl } from '@/utils/auth/apiPaths';
import { getChapterData, getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates, toLocalizedNumber } from '@/utils/locale';
import { getCanonicalUrl, getVerseAnswersNavigationUrl } from '@/utils/navigation';
import { isValidVerseKey } from '@/utils/validator';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';
import withSsrRedux from '@/utils/withSsrRedux';
import { ChapterResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';

type SelectedAyahQuestionsPageProps = {
  chapter?: ChapterResponse;
  verseNumber?: string;
  chapterId?: string;
  chaptersData: ChaptersData;
  fallback?: any;
};

const SelectedAyahQuestionsPage: NextPage<SelectedAyahQuestionsPageProps> = ({
  chapter,
  verseNumber,
  chapterId,
  fallback,
}) => {
  const { t, lang } = useTranslation('question');

  const navigationUrl = getVerseAnswersNavigationUrl(`${chapterId}:${verseNumber}`);
  const verseQuestionsUrl = makeGetQuestionsByVerseKeyUrl({
    verseKey: `${chapterId}:${verseNumber}`,
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
      <div className={layoutStyle.pageContainer}>
        <div className={layoutStyle.flow}>
          <div className={layoutStyle.flowItem}>
            <QuestionsBodyContainer
              initialChapterId={chapterId}
              initialVerseNumber={verseNumber.toString()}
              initialData={fallback[verseQuestionsUrl]}
              render={({ body }) => <div>{body}</div>}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = withSsrRedux(
  '/[chapterId]/answers',
  async (context) => {
    const { params, locale } = context;
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
      const verseQuestionsUrl = makeGetQuestionsByVerseKeyUrl({
        verseKey,
        language: locale as Language,
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
      const [verseQuestionsData, versesData] = await Promise.all([
        getAyahQuestions(verseKey, locale as Language),
        fetcher(versesUrl),
      ]);

      const fallback = {
        [verseQuestionsUrl]: verseQuestionsData,
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
      };
    } catch (error) {
      logErrorToSentry(error, {
        transactionName: 'getServerSideProps-VerseQuestionsPage',
        metadata: {
          chapterIdOrSlug: String(params.chapterId),
          locale,
          verseKey,
        },
      });
      return { notFound: true };
    }
  },
);

export default SelectedAyahQuestionsPage;

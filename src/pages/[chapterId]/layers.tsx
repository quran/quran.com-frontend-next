/* eslint-disable react-func/max-lines-per-function */
import React from 'react';

import { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { SWRConfig } from 'swr';

import { fetcher, getPagesLookup, getLayeredTranslationByVerse } from '@/api';
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
import { LayeredTranslationApiResponse } from '@/types/LayeredTranslation';
import { QuranReaderDataType } from '@/types/QuranReader';
import Verse from '@/types/Verse';
import { getMushafId } from '@/utils/api';
import { makeLayeredTranslationByVerseUrl } from '@/utils/apiPaths';
import { getChapterData, getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates, toLocalizedNumber } from '@/utils/locale';
import { getCanonicalUrl, getVerseLayersNavigationUrl } from '@/utils/navigation';
import {
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
} from '@/utils/staticPageGeneration';
import { isValidVerseKey } from '@/utils/validator';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';
import { buildVersesResponse, buildStudyModeVerseUrl } from '@/utils/verseKeys';

type AyahLayersProp = {
  chapter?: ChapterResponse;
  verseNumber?: string;
  chapterId?: string;
  chaptersData: ChaptersData;
  fallback?: Record<string, unknown>;
  verse?: Verse;
  versesResponse?: VersesResponse;
  layeredTranslationData?: LayeredTranslationApiResponse;
};

const AyahLayersPage: NextPage<AyahLayersProp> = ({
  chapter,
  verseNumber,
  chapterId,
  fallback,
  verse,
  versesResponse,
}) => {
  const { t, lang } = useTranslation('quran-reader');

  const navigationUrl = getVerseLayersNavigationUrl(`${chapterId}:${verseNumber}`);

  return (
    <>
      <NextSeoWrapper
        title={`${chapter.chapter.transliteratedName} - ${toLocalizedNumber(
          Number(verseNumber),
          lang,
        )} ${t('layers.title')}`}
        image={getChapterOgImageUrl({ chapterId, verseNumber, locale: lang })}
        imageWidth={1200}
        imageHeight={630}
        canonical={getCanonicalUrl(lang, navigationUrl)}
        languageAlternates={getLanguageAlternates(navigationUrl)}
        description={t('layers.description', {
          ayahNumber: toLocalizedNumber(Number(verseNumber), lang),
          surahName: chapter.chapter.transliteratedName,
        })}
      />
      {/* @ts-ignore */}
      <SWRConfig value={{ fallback }}>
        <StudyModeSsrContainer
          initialTab={StudyModeTabId.LAYERS}
          chapterId={chapterId}
          verseNumber={verseNumber}
          verse={verse}
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

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const { chapterId } = params;
  const verseKey = String(chapterId);
  const chaptersData = await getAllChaptersData(locale);

  if (!isValidVerseKey(chaptersData, verseKey)) return { notFound: true };

  const [chapterNumber, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
  const { quranFont, mushafLines } = getQuranReaderStylesInitialState(locale);
  const translations = getTranslationsInitialState(locale).selectedTranslations;

  try {
    const layeredTranslationUrl = makeLayeredTranslationByVerseUrl(verseKey, locale as Language);

    const mushafId = getMushafId(quranFont, mushafLines).mushaf;
    const verseUrl = buildStudyModeVerseUrl(verseKey, quranFont, mushafLines, translations);

    const [layeredTranslationData, verseData, pagesLookupResponse] = await Promise.all([
      getLayeredTranslationByVerse(verseKey, locale as Language),
      fetcher(verseUrl) as Promise<VerseResponse>,
      getPagesLookup({
        chapterNumber: Number(chapterNumber),
        mushaf: mushafId,
      }),
    ]);

    const versesResponse = buildVersesResponse(chaptersData, pagesLookupResponse);

    const fallback = {
      [layeredTranslationUrl]: layeredTranslationData,
      [verseUrl]: verseData,
    };

    return {
      props: {
        chaptersData,
        chapterId: chapterNumber,
        chapter: { chapter: { ...getChapterData(chaptersData, chapterNumber), id: chapterNumber } },
        verseNumber,
        fallback,
        verse: verseData.verse,
        versesResponse,
        layeredTranslationData,
      },
      revalidate: ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
    };
  } catch (error) {
    logErrorToSentry(error, {
      transactionName: 'getStaticProps-LayersPage',
      metadata: { chapterIdOrSlug: String(params.chapterId), locale },
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

export default AyahLayersPage;

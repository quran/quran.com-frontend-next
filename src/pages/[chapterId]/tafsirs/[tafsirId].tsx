/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import React, { useEffect } from 'react';

import { NextPage, GetStaticProps, GetStaticPaths } from 'next';
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
import {
  ChapterResponse,
  TafsirContentResponse,
  VersesResponse,
  VerseResponse,
} from '@/types/ApiResponses';
import ChaptersData from '@/types/ChaptersData';
import { QuranReaderDataType } from '@/types/QuranReader';
import Verse from '@/types/Verse';
import { getMushafId } from '@/utils/api';
import { makeTafsirContentUrl, makeTafsirsUrl } from '@/utils/apiPaths';
import { getAllChaptersData, getChapterData } from '@/utils/chapter';
import { logEvent } from '@/utils/eventLogger';
import { getLanguageAlternates, toLocalizedNumber } from '@/utils/locale';
import { getCanonicalUrl, getVerseSelectedTafsirNavigationUrl } from '@/utils/navigation';
import {
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
} from '@/utils/staticPageGeneration';
import { isValidVerseKey } from '@/utils/validator';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';
import { buildVersesResponse, buildStudyModeVerseUrl } from '@/utils/verseKeys';

type AyahTafsirProp = {
  chapter?: ChapterResponse;
  verseNumber?: string;
  tafsirIdOrSlug?: string;
  chapterId?: string;
  tafsirData?: TafsirContentResponse;
  chaptersData: ChaptersData;
  fallback: Record<string, unknown>;
  verse?: Verse;
  versesResponse?: VersesResponse;
};

const AyahTafsirPage: NextPage<AyahTafsirProp> = ({
  chapter,
  verseNumber,
  chapterId,
  tafsirData,
  tafsirIdOrSlug,
  fallback,
  verse,
  versesResponse,
}) => {
  const { t, lang } = useTranslation('common');

  // Log tafsir URL access event once when page loads (direct URL navigation)
  useEffect(() => {
    logEvent('tafsir_url_access');
  }, []);

  const navigationUrl = getVerseSelectedTafsirNavigationUrl(
    chapterId,
    Number(verseNumber),
    tafsirData.tafsir.slug,
  );
  const localizedVerseNumber = toLocalizedNumber(Number(verseNumber), lang);

  return (
    <>
      <NextSeoWrapper
        title={`${t('tafsir.surah')} ${
          chapter.chapter.transliteratedName
        } - ${localizedVerseNumber}`}
        image={getChapterOgImageUrl({
          chapterId,
          verseNumber,
          locale: lang,
        })}
        imageWidth={1200}
        imageHeight={630}
        canonical={getCanonicalUrl(lang, navigationUrl)}
        description={t('tafsir.tafsir-desc', {
          verseNumber: localizedVerseNumber,
          tafsirName: tafsirData.tafsir.translatedName.name,
          surahName: chapter.chapter.transliteratedName,
        })}
        languageAlternates={getLanguageAlternates(navigationUrl)}
      />
      {/* @ts-ignore */}
      <SWRConfig value={{ fallback }}>
        <StudyModeSsrContainer
          initialTab={StudyModeTabId.TAFSIR}
          chapterId={chapterId}
          verseNumber={verseNumber}
          verse={verse}
          tafsirIdOrSlug={tafsirIdOrSlug}
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
  const { chapterId, tafsirId: tafsirIdOrSlug } = params;
  const verseKey = String(chapterId);
  const chaptersData = await getAllChaptersData(locale);

  if (!isValidVerseKey(chaptersData, verseKey)) {
    return { notFound: true };
  }

  const [chapterNumber, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
  const { quranFont, mushafLines } = getQuranReaderStylesInitialState(locale);
  const translations = getTranslationsInitialState(locale).selectedTranslations;

  try {
    const tafsirContentUrl = makeTafsirContentUrl(tafsirIdOrSlug as string, verseKey, {
      lang: locale,
      quranFont,
      mushafLines,
    });
    const tafsirListUrl = makeTafsirsUrl(locale);

    const mushafId = getMushafId(quranFont, mushafLines).mushaf;
    const verseUrl = buildStudyModeVerseUrl(verseKey, quranFont, mushafLines, translations);

    const [tafsirContentData, tafsirListData, verseData, pagesLookupResponse] = await Promise.all([
      fetcher(tafsirContentUrl),
      fetcher(tafsirListUrl),
      fetcher(verseUrl) as Promise<VerseResponse>,
      getPagesLookup({
        chapterNumber: Number(chapterNumber),
        mushaf: mushafId,
      }),
    ]);

    const versesResponse = buildVersesResponse(chaptersData, pagesLookupResponse);

    return {
      props: {
        chaptersData,
        chapterId: chapterNumber,
        chapter: { chapter: { ...getChapterData(chaptersData, chapterNumber), id: chapterNumber } },
        fallback: {
          [tafsirListUrl]: tafsirListData,
          [tafsirContentUrl]: tafsirContentData,
          [verseUrl]: verseData,
        },
        tafsirData: tafsirContentData,
        verseNumber,
        tafsirIdOrSlug,
        verse: verseData.verse,
        versesResponse,
      },
      revalidate: ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
    };
  } catch (error) {
    logErrorToSentry(error, {
      transactionName: 'getStaticProps-TafsirPage',
      metadata: {
        chapterIdOrSlug: String(params.chapterId),
        tafsirIdOrSlug: String(params.tafsirId),
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

export default AyahTafsirPage;

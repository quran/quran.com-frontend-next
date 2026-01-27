/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import React, { useEffect } from 'react';

import { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { SWRConfig } from 'swr';

import { fetcher, getChapterIdBySlug, getPagesLookup } from '@/api';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import QuranReader from '@/components/QuranReader';
import { StudyModeTabId } from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeBottomActions';
import StudyModeSsrContainer from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeSsrContainer';
import { getChapterOgImageUrl } from '@/lib/og';
import { logErrorToSentry } from '@/lib/sentry';
import {
  getQuranReaderStylesInitialState,
  getTafsirsInitialState,
  getTranslationsInitialState,
} from '@/redux/defaultSettings/util';
import {
  ChapterResponse,
  TafsirContentResponse,
  VersesResponse,
  VerseResponse,
} from '@/types/ApiResponses';
import ChaptersData from '@/types/ChaptersData';
import Language from '@/types/Language';
import { QuranReaderDataType } from '@/types/QuranReader';
import Verse from '@/types/Verse';
import { getMushafId } from '@/utils/api';
import { makeTafsirContentUrl, makeTafsirsUrl } from '@/utils/apiPaths';
import { getAllChaptersData, getChapterData } from '@/utils/chapter';
import { logEvent } from '@/utils/eventLogger';
import { getLanguageAlternates, toLocalizedNumber } from '@/utils/locale';
import { getCanonicalUrl, getVerseTafsirNavigationUrl } from '@/utils/navigation';
import {
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
} from '@/utils/staticPageGeneration';
import { isValidVerseId } from '@/utils/validator';
import { makeVerseKey } from '@/utils/verse';
import { buildVersesResponse, buildStudyModeVerseUrl } from '@/utils/verseKeys';

type AyahTafsirProp = {
  chapter: ChapterResponse;
  verseNumber: string;
  chapterId: string;
  tafsirData: TafsirContentResponse;
  chaptersData: ChaptersData;
  fallback: Record<string, unknown>;
  verse: Verse;
  versesResponse: VersesResponse;
};

const AyahTafsirPage: NextPage<AyahTafsirProp> = ({
  chapter,
  verseNumber,
  chapterId,
  tafsirData,
  fallback,
  verse,
  versesResponse,
}) => {
  const { t, lang } = useTranslation('common');

  // Log tafsir URL access event once when page loads (direct URL navigation)
  useEffect(() => {
    logEvent('tafsir_url_access');
  }, []);

  const navigationUrl = getVerseTafsirNavigationUrl(chapter.chapter.slug, Number(verseNumber));
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
        description={t('tafsir.tafsirs-desc', {
          ayahNumber: localizedVerseNumber,
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
          tafsirIdOrSlug={tafsirData?.tafsir?.slug}
        />
        {chapter.chapter.id && versesResponse && (
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
  try {
    let chapterIdOrSlug = String(params.chapterId);
    const verseId = String(params.verseId);

    // 1. make sure the chapter Id/slug is valid using BE since slugs are stored in BE first
    const sluggedChapterId = await getChapterIdBySlug(chapterIdOrSlug, locale);
    if (sluggedChapterId) {
      chapterIdOrSlug = sluggedChapterId;
    }

    const chaptersData = await getAllChaptersData(locale);

    // 2. make sure that verse id is valid before calling BE to get the verses.
    if (!isValidVerseId(chaptersData, chapterIdOrSlug, verseId)) {
      return { notFound: true };
    }

    const chapterData = getChapterData(chaptersData, chapterIdOrSlug);
    if (!chapterData) {
      return { notFound: true, revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS };
    }

    const { quranFont, mushafLines } = getQuranReaderStylesInitialState(locale as Language);
    const translations = getTranslationsInitialState(locale as Language).selectedTranslations;
    const verseKey = makeVerseKey(Number(chapterIdOrSlug), Number(verseId));
    const selectedTafsir = getTafsirsInitialState(locale as Language).selectedTafsirs[0];

    const tafsirContentUrl = makeTafsirContentUrl(selectedTafsir, verseKey, {
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
        chapterNumber: Number(chapterIdOrSlug),
        mushaf: mushafId,
      }),
    ]);

    const versesResponse = buildVersesResponse(chaptersData, pagesLookupResponse);

    return {
      props: {
        chaptersData,
        chapterId: chapterIdOrSlug,
        chapter: { chapter: { ...chapterData, id: chapterIdOrSlug } },
        fallback: {
          [tafsirListUrl]: tafsirListData,
          [tafsirContentUrl]: tafsirContentData,
          [verseUrl]: verseData,
        },
        tafsirData: tafsirContentData,
        verseNumber: verseId,
        verse: verseData.verse,
        versesResponse,
      },
      revalidate: ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
    };
  } catch (error) {
    logErrorToSentry(error, {
      transactionName: 'getStaticProps-VerseTafsirsPage',
      metadata: {
        chapterIdOrSlug: String(params.chapterId),
        verseId: String(params.verseId),
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

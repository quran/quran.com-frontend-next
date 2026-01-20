/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import React, { useEffect } from 'react';

import { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { SWRConfig } from 'swr';

import { fetcher } from '@/api';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import { StudyModeTabId } from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeBottomActions';
import StudyModeSSRPage from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeSSRPage';
import { getChapterOgImageUrl } from '@/lib/og';
import { logErrorToSentry } from '@/lib/sentry';
import {
  getQuranReaderStylesInitialState,
  getTranslationsInitialState,
} from '@/redux/defaultSettings/util';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { makeByVerseKeyUrl, makeTafsirContentUrl, makeTafsirsUrl } from '@/utils/apiPaths';
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
import { ChapterResponse, TafsirContentResponse, VerseResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';
import Verse from 'types/Verse';

type AyahTafsirProp = {
  chapter?: ChapterResponse;
  verseNumber?: string;
  tafsirIdOrSlug?: string;
  chapterId?: string;
  tafsirData?: TafsirContentResponse;
  chaptersData: ChaptersData;
  fallback: Record<string, unknown>;
  verse?: Verse;
};

const AyahTafsirPage: NextPage<AyahTafsirProp> = ({
  chapter,
  verseNumber,
  chapterId,
  tafsirIdOrSlug,
  tafsirData,
  fallback,
  verse,
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
        <StudyModeSSRPage
          initialTab={StudyModeTabId.TAFSIR}
          chapterId={chapterId}
          verseNumber={verseNumber}
          verse={verse}
          tafsirIdOrSlug={tafsirIdOrSlug}
          locale={lang}
        />
      </SWRConfig>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const { chapterId, tafsirId: tafsirIdOrSlug } = params;
  const verseKey = String(chapterId);
  const chaptersData = await getAllChaptersData(locale);
  // if the verse key or the tafsir id is not valid
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

    // Fetch verse data for StudyModeBody
    const verseUrl = makeByVerseKeyUrl(verseKey, {
      words: true,
      translationFields: 'resource_name,language_id',
      translations: translations.join(','),
      ...getDefaultWordFields(quranFont),
      ...getMushafId(quranFont, mushafLines),
      wordTranslationLanguage: 'en',
      wordTransliteration: 'true',
    });

    const [tafsirContentData, tafsirListData, verseData] = await Promise.all([
      fetcher(tafsirContentUrl) as Promise<TafsirContentResponse>,
      fetcher(tafsirListUrl),
      fetcher(verseUrl) as Promise<VerseResponse>,
    ]);

    return {
      props: {
        chaptersData,
        chapterId: chapterNumber,
        chapter: { chapter: getChapterData(chaptersData, chapterNumber) },
        fallback: {
          [tafsirListUrl]: tafsirListData,
          [tafsirContentUrl]: tafsirContentData,
          [verseUrl]: verseData,
        },
        tafsirData: tafsirContentData,
        verseNumber,
        tafsirIdOrSlug,
        verse: verseData.verse,
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
  paths: [], // no pre-rendered chapters at build time.
  fallback: 'blocking', // will server-render pages on-demand if the path doesn't exist.
});

export default AyahTafsirPage;

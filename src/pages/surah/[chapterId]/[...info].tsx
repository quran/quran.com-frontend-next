/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable react-func/max-lines-per-function */
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { SWRConfig } from 'swr';

import { getPagesLookup, getChapterInfo, getChapterIdBySlug } from '@/api';
import SurahInfoPage from '@/components/chapters/Info/SurahInfoPage';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import QuranReader from '@/components/QuranReader';
import { getChapterOgImageUrl } from '@/lib/og';
import { logErrorToSentry } from '@/lib/sentry';
import { getQuranReaderStylesInitialState } from '@/redux/defaultSettings/util';
import { ChapterResponse, VersesResponse, ChapterInfoResponse } from '@/types/ApiResponses';
import ChapterInfoResource from '@/types/ChapterInfo';
import ChaptersData from '@/types/ChaptersData';
import Language from '@/types/Language';
import { QuranReaderDataType } from '@/types/QuranReader';
import { getMushafId } from '@/utils/api';
import { makeChapterInfoUrl } from '@/utils/apiPaths';
import { getAllChaptersData, getChapterData } from '@/utils/chapter';
import { toLocalizedNumber, getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getSurahInfoNavigationUrl } from '@/utils/navigation';
import {
  ONE_MONTH_REVALIDATION_PERIOD_SECONDS,
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
} from '@/utils/staticPageGeneration';
import { isValidChapterId } from '@/utils/validator';
import { generateVerseKeysBetweenTwoVerseKeys } from '@/utils/verseKeys';

type ChapterInfoProps = {
  chaptersData: ChaptersData;
  chapterResponse: ChapterResponse;
  versesResponse: VersesResponse;
  chapterInfoResponse: ChapterInfoResponse;
  quranReaderDataType: QuranReaderDataType;
  initialResourceId?: string;
  fallback?: Record<string, unknown>;
};

const ChapterInfo: NextPage<ChapterInfoProps> = ({
  chapterResponse,
  versesResponse,
  chapterInfoResponse,
  quranReaderDataType,
  initialResourceId,
  fallback,
}) => {
  const { t, lang } = useTranslation('common');

  // Early return if required data is missing
  if (!versesResponse || !chapterResponse || !chapterInfoResponse?.chapterInfo) return null;
  const navigationUrl = getSurahInfoNavigationUrl(chapterResponse.chapter.slug);

  return (
    <>
      <NextSeoWrapper
        title={`${t('surah')} ${chapterResponse.chapter.transliteratedName} - ${toLocalizedNumber(
          1,
          lang,
        )}-${toLocalizedNumber(chapterResponse.chapter.versesCount, lang)}`}
        image={getChapterOgImageUrl({
          chapterId: chapterInfoResponse.chapterInfo.id,
          locale: lang,
        })}
        imageWidth={1200}
        imageHeight={630}
        canonical={getCanonicalUrl(lang, navigationUrl)}
        languageAlternates={getLanguageAlternates(navigationUrl)}
        description={chapterInfoResponse.chapterInfo.shortText}
      />

      <SWRConfig value={{ fallback }}>
        <SurahInfoPage
          chapterInfo={chapterInfoResponse.chapterInfo}
          chapter={chapterResponse.chapter}
          resources={chapterInfoResponse.resources}
          initialResourceId={initialResourceId}
          chapterId={chapterResponse.chapter.id}
        />
      </SWRConfig>

      <QuranReader
        initialData={versesResponse}
        id={chapterResponse.chapter.id}
        quranReaderDataType={quranReaderDataType}
      />
    </>
  );
};

const getChapterInfoData = async (chapterId: string, locale: string) => {
  const defaultMushafId = getMushafId(
    getQuranReaderStylesInitialState(locale as Language).quranFont,
    getQuranReaderStylesInitialState(locale as Language).mushafLines,
  ).mushaf;

  const pagesLookupResponse = await getPagesLookup({
    chapterNumber: Number(chapterId),
    mushaf: defaultMushafId,
  });

  const chaptersData = await getAllChaptersData(locale);
  const numberOfVerses = generateVerseKeysBetweenTwoVerseKeys(
    chaptersData,
    pagesLookupResponse.lookupRange.from,
    pagesLookupResponse.lookupRange.to,
  ).length;

  const minimalVersesResponse: VersesResponse = {
    metaData: { numberOfVerses },
    pagesLookup: pagesLookupResponse,
    verses: [],
    pagination: {
      perPage: 10,
      currentPage: 1,
      nextPage: null,
      totalRecords: numberOfVerses,
      totalPages: Math.ceil(numberOfVerses / 10),
    },
  };

  return { versesResponse: minimalVersesResponse, chaptersData };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { params, locale } = context;
  let chapterId = String(params.chapterId);
  // Extract the info array - it can be undefined (for /surah/1/info) or ['resourceId'] (for /surah/1/info/58)
  const infoArray = params.info as string[] | undefined;
  const resourceId = infoArray?.[0]; // First element is the resource ID if present

  if (!isValidChapterId(chapterId)) {
    const sluggedChapterId = await getChapterIdBySlug(chapterId, locale);
    if (!sluggedChapterId) return { notFound: true };
    chapterId = sluggedChapterId;
  }

  try {
    const { versesResponse, chaptersData } = await getChapterInfoData(chapterId, locale);
    const chapterData = getChapterData(chaptersData, chapterId);

    // Fetch chapter info with resource filter if provided, and include resources list
    const chapterInfoResponse = await getChapterInfo(chapterId, locale, {
      resourceId,
      includeResources: true,
    });

    /**
     * If the request succeeds, `chapterInfo` should exist.
     * Its absence means the surah has no chapter info yet.
     */
    if (!chapterInfoResponse?.chapterInfo) return { notFound: true };

    // Create fallback for SWR to avoid client-side refetch
    const apiParams = resourceId
      ? { resource_id: resourceId, language: locale }
      : { language: locale };
    const fallback = {
      [makeChapterInfoUrl(chapterId, locale, { resourceId, includeResources: true })]:
        chapterInfoResponse,
    };

    return {
      props: {
        chaptersData,
        chapterResponse: { chapter: { ...chapterData, id: chapterId } },
        versesResponse,
        chapterInfoResponse,
        quranReaderDataType: QuranReaderDataType.Chapter,
        initialResourceId: resourceId || null,
        fallback,
      },

      revalidate: ONE_MONTH_REVALIDATION_PERIOD_SECONDS,
    };
  } catch (error) {
    logErrorToSentry(error, {
      transactionName: 'getStaticProps-SurahInfoPage',
      metadata: { chapterId, locale, resourceId },
    });

    return { notFound: true, revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS };
  }
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: 'blocking',
});

export default ChapterInfo;

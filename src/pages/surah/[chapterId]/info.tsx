import { NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';

import { getPagesLookup, getChapterInfo } from '@/api';
import SurahInfoPage from '@/components/chapters/Info/SurahInfoPage';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import QuranReader from '@/components/QuranReader';
import { getChapterOgImageUrl } from '@/lib/og';
import { logErrorToSentry } from '@/lib/sentry';
import { getQuranReaderStylesInitialState } from '@/redux/defaultSettings/util';
import Language from '@/types/Language';
import { QuranReaderDataType } from '@/types/QuranReader';
import { getMushafId } from '@/utils/api';
import { getAllChaptersData, getChapterData } from '@/utils/chapter';
import { toLocalizedNumber, getLocaleName, getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getSurahNavigationUrl } from '@/utils/navigation';
import { isValidChapterId } from '@/utils/validator';
import { generateVerseKeysBetweenTwoVerseKeys } from '@/utils/verseKeys';
import withSsrRedux from '@/utils/withSsrRedux';
import { ChapterResponse, VersesResponse, ChapterInfoResponse } from 'types/ApiResponses';

type ChapterProps = {
  chapterResponse?: ChapterResponse;
  versesResponse?: VersesResponse;
  chapterInfoResponse?: ChapterInfoResponse;
  quranReaderDataType: QuranReaderDataType;
};

const Chapter: NextPage<ChapterProps> = ({
  chapterResponse,
  versesResponse,
  chapterInfoResponse,
  quranReaderDataType,
}) => {
  const { t, lang } = useTranslation('common');

  // Early return if required data is missing
  if (!versesResponse || !chapterResponse) return null;

  const getTitle = () =>
    `${toLocalizedNumber(1, lang)}-${toLocalizedNumber(
      chapterResponse!.chapter.versesCount,
      lang,
    )}`;

  const getPath = () => getSurahNavigationUrl(chapterResponse!.chapter.slug);

  const getSEOTitle = () =>
    `${t('surah')} ${chapterResponse!.chapter.transliteratedName} - ${getTitle()}`;

  const getOGImage = () =>
    getChapterOgImageUrl({
      chapterId: chapterResponse!.chapter.id,
      locale: lang,
    });

  const getDescription = () =>
    t('chapter:meta-description', {
      transliteratedName: chapterResponse!.chapter.transliteratedName,
      translatedName: chapterResponse!.chapter.translatedName as string,
      revelationPlace: t(`surah-info:${chapterResponse!.chapter.revelationPlace}`),
      chapterOrder: toLocalizedNumber(Number(chapterResponse!.chapter.id), lang),
      localeName: getLocaleName(lang),
      versesCount: toLocalizedNumber(chapterResponse!.chapter.versesCount, lang),
    });

  return (
    <>
      <NextSeoWrapper
        title={getSEOTitle()}
        canonical={getCanonicalUrl(lang, getPath())}
        image={getOGImage()}
        imageWidth={1200}
        imageHeight={630}
        description={getDescription()}
        languageAlternates={getLanguageAlternates(getPath())}
      />

      <SurahInfoPage
        chapterInfo={chapterInfoResponse?.chapterInfo}
        chapter={chapterResponse.chapter}
      />

      <QuranReader
        initialData={versesResponse}
        id={chapterResponse!.chapter.id}
        quranReaderDataType={quranReaderDataType}
      />
    </>
  );
};

const getChapterVersesData = async (chapterId: string, locale: string) => {
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

export const getServerSideProps = withSsrRedux('/surah/[chapterId]/info', async (context) => {
  const { params, locale } = context;
  const chapterId = String(params.chapterId);

  if (!isValidChapterId(chapterId)) {
    return { notFound: true };
  }

  try {
    const { versesResponse, chaptersData } = await getChapterVersesData(chapterId, locale);
    const chapterData = getChapterData(chaptersData, chapterId);
    const chapterInfoResponse = await getChapterInfo(chapterId, locale);

    return {
      props: {
        chapterResponse: { chapter: { ...chapterData, id: chapterId } },
        versesResponse,
        chapterInfoResponse,
        quranReaderDataType: QuranReaderDataType.Chapter,
      },
    };
  } catch (error) {
    logErrorToSentry(error, {
      transactionName: 'getServerSideProps-SurahInfoPage',
      metadata: { chapterId, locale },
    });

    return { notFound: true };
  }
});

export default Chapter;

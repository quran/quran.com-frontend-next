/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { SWRConfig } from 'swr';

import styles from './tafsirs.module.scss';

import { fetcher, getChapterIdBySlug } from '@/api';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import TafsirBody from '@/components/QuranReader/TafsirView/TafsirBody';
import { logErrorToSentry } from '@/lib/sentry';
import {
  getQuranReaderStylesInitialState,
  getTafsirsInitialState,
} from '@/redux/defaultSettings/util';
import { makeTafsirContentUrl, makeTafsirsUrl } from '@/utils/apiPaths';
import { getAllChaptersData, getChapterData } from '@/utils/chapter';
import { getLanguageAlternates, toLocalizedNumber } from '@/utils/locale';
import {
  getCanonicalUrl,
  getVerseTafsirNavigationUrl,
  scrollWindowToTop,
} from '@/utils/navigation';
import {
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
} from '@/utils/staticPageGeneration';
import { isValidVerseId } from '@/utils/validator';
import { makeVerseKey } from '@/utils/verse';
import { ChapterResponse, VersesResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';

type AyahTafsirProp = {
  chapter?: ChapterResponse;
  verses?: VersesResponse;
  chaptersData: ChaptersData;
  fallback: any;
};

const AyahTafsirPage: NextPage<AyahTafsirProp> = ({ chapter, fallback }) => {
  const { t, lang } = useTranslation('common');
  const router = useRouter();
  const {
    query: { verseId },
  } = router;
  const path = getVerseTafsirNavigationUrl(chapter.chapter.slug, Number(verseId));

  const localizedVerseNumber = toLocalizedNumber(Number(verseId), lang);
  return (
    <>
      <NextSeoWrapper
        title={`${t('tafsir.surah')} ${
          chapter.chapter.transliteratedName
        } - ${localizedVerseNumber}`}
        canonical={getCanonicalUrl(lang, path)}
        languageAlternates={getLanguageAlternates(path)}
        description={t('tafsir.tafsirs-desc', {
          ayahNumber: localizedVerseNumber,
          surahName: chapter.chapter.transliteratedName,
        })}
      />
      {/* @ts-ignore */}
      <SWRConfig value={{ fallback }}>
        <div className={styles.tafsirContainer}>
          <TafsirBody
            shouldRender
            initialChapterId={chapter.chapter.id.toString()}
            initialVerseNumber={verseId.toString()}
            initialTafsirIdOrSlug={
              router.query.tafsirId ? Number(router.query.tafsirId) : undefined
            }
            scrollToTop={scrollWindowToTop}
            render={({ body, languageAndTafsirSelection, surahAndAyahSelection }) => {
              return (
                <div>
                  {surahAndAyahSelection}
                  {languageAndTafsirSelection}
                  {body}
                </div>
              );
            }}
          />
        </div>
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
    const { quranFont, mushafLines } = getQuranReaderStylesInitialState(locale);

    const tafsirContentUrl = makeTafsirContentUrl(
      getTafsirsInitialState(locale).selectedTafsirs[0],
      makeVerseKey(Number(chapterIdOrSlug), Number(verseId)),
      {
        lang: locale,
        quranFont,
        mushafLines,
      },
    );
    const tafsirListUrl = makeTafsirsUrl(locale);

    const [tafsirContentData, tafsirListData] = await Promise.all([
      fetcher(tafsirContentUrl),
      fetcher(tafsirListUrl),
    ]);

    if (!chapterData) return { notFound: true, revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS };

    return {
      props: {
        chaptersData,
        fallback: {
          [tafsirContentUrl]: tafsirContentData,
          [tafsirListUrl]: tafsirListData,
        },
        chapter: {
          chapter: { ...chapterData, id: chapterIdOrSlug },
        },
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
  paths: [], // no pre-rendered chapters at build time.
  fallback: 'blocking', // will server-render pages on-demand if the path doesn't exist.
});

export default AyahTafsirPage;

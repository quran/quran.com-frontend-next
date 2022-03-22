/* eslint-disable react-func/max-lines-per-function */
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';

import styles from './tafsirs.module.scss';

import { getChapterIdBySlug, getTafsirContent } from 'src/api';
import NextSeoWrapper from 'src/components/NextSeoWrapper';
import TafsirBody from 'src/components/QuranReader/TafsirView/TafsirBody';
import DataContext from 'src/contexts/DataContext';
import Error from 'src/pages/_error';
import {
  getQuranReaderStylesInitialState,
  getTafsirsInitialState,
} from 'src/redux/defaultSettings/util';
import { getAllChaptersData, getChapterData } from 'src/utils/chapter';
import { getLanguageAlternates, toLocalizedNumber } from 'src/utils/locale';
import {
  getCanonicalUrl,
  getVerseTafsirNavigationUrl,
  scrollWindowToTop,
} from 'src/utils/navigation';
import {
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
} from 'src/utils/staticPageGeneration';
import { isValidVerseId } from 'src/utils/validator';
import { makeVerseKey } from 'src/utils/verse';
import { ChapterResponse, TafsirContentResponse, VersesResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';

type AyahTafsirProp = {
  chapter?: ChapterResponse;
  verses?: VersesResponse;
  tafsirData?: TafsirContentResponse;
  hasError?: boolean;
  chaptersData: ChaptersData;
};

const AyahTafsir: NextPage<AyahTafsirProp> = ({ hasError, chapter, tafsirData, chaptersData }) => {
  const { t, lang } = useTranslation('common');
  const router = useRouter();
  const {
    query: { verseId },
  } = router;
  if (hasError) {
    return <Error statusCode={500} />;
  }
  const path = getVerseTafsirNavigationUrl(chapter.chapter.slug, Number(verseId));

  const localizedVerseNumber = toLocalizedNumber(Number(verseId), lang);
  return (
    <DataContext.Provider value={chaptersData}>
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
      <div className={styles.tafsirContainer}>
        <TafsirBody
          shouldRender
          initialChapterId={chapter.chapter.id.toString()}
          initialVerseNumber={verseId.toString()}
          initialTafsirData={tafsirData}
          initialTafsirIdOrSlug={router.query.tafsirId ? Number(router.query.tafsirId) : undefined}
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
    </DataContext.Provider>
  );
};

const notFoundResponse = {
  props: {
    hasError: true,
  },
  revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS, // 35 seconds will be enough time before we re-try generating the page again.
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
    const tafsirData = await getTafsirContent(
      getTafsirsInitialState(locale).selectedTafsirs[0],
      makeVerseKey(Number(chapterIdOrSlug), Number(verseId)),
      quranFont,
      mushafLines,
      locale,
    );

    if (!chapterData) return notFoundResponse;

    return {
      props: {
        chaptersData,
        tafsirData,
        chapter: {
          chapter: { ...chapterData, id: chapterIdOrSlug },
        },
      },
      revalidate: ONE_WEEK_REVALIDATION_PERIOD_SECONDS, // verses will be generated at runtime if not found in the cache, then cached for subsequent requests for 7 days.
    };
  } catch (error) {
    return notFoundResponse;
  }
};
export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [], // no pre-rendered chapters at build time.
  fallback: 'blocking', // will server-render pages on-demand if the path doesn't exist.
});

export default AyahTafsir;

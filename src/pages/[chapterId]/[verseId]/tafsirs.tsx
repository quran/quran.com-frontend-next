/* eslint-disable react-func/max-lines-per-function */
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { SWRConfig } from 'swr';

import styles from './tafsirs.module.scss';

import { fetcher, getChapterIdBySlug } from 'src/api';
import NextSeoWrapper from 'src/components/NextSeoWrapper';
import TafsirBody from 'src/components/QuranReader/TafsirView/TafsirBody';
import Error from 'src/pages/_error';
import {
  getQuranReaderStylesInitialState,
  getTafsirsInitialState,
} from 'src/redux/defaultSettings/util';
import { makeTafsirContentUrl, makeTafsirsUrl } from 'src/utils/apiPaths';
import { getChapterData } from 'src/utils/chapter';
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
import { ChapterResponse, VersesResponse } from 'types/ApiResponses';

type AyahTafsirProp = {
  chapter?: ChapterResponse;
  verses?: VersesResponse;
  hasError?: boolean;
  fallback: any;
};

const AyahTafsir: NextPage<AyahTafsirProp> = ({ hasError, chapter, fallback }) => {
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
    // 2. make sure that verse id is valid before calling BE to get the verses.
    if (!isValidVerseId(chapterIdOrSlug, verseId)) {
      return { notFound: true };
    }

    const chapterData = getChapterData(chapterIdOrSlug, locale);
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

    if (!chapterData) return notFoundResponse;

    return {
      props: {
        fallback: {
          [tafsirContentUrl]: tafsirContentData,
          [tafsirListUrl]: tafsirListData,
        },
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

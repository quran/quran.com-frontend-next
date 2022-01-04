/* eslint-disable react-func/max-lines-per-function */
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';

import styles from './tafsirs.module.scss';

import { getChapterIdBySlug, fetcher } from 'src/api';
import NextSeoWrapper from 'src/components/NextSeoWrapper';
import TafsirBody from 'src/components/QuranReader/TafsirView/TafsirBody';
import Error from 'src/pages/_error';
import { getTafsirsInitialState } from 'src/redux/defaultSettings/util';
import { getDefaultWordFields } from 'src/utils/api';
import { makeTafsirContentUrl } from 'src/utils/apiPaths';
import { getChapterData } from 'src/utils/chapter';
import { getLanguageAlternates, toLocalizedNumber } from 'src/utils/locale';
import { getCanonicalUrl, getVerseTafsirNavigationUrl } from 'src/utils/navigation';
import {
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
} from 'src/utils/staticPageGeneration';
import { stripHTMLTags } from 'src/utils/string';
import { isValidVerseId } from 'src/utils/validator';
import { makeVerseKey } from 'src/utils/verse';
import { ChapterResponse, TafsirContentResponse, VersesResponse } from 'types/ApiResponses';

type AyahTafsirProp = {
  chapter?: ChapterResponse;
  verses?: VersesResponse;
  tafsirData?: any;
  hasError?: boolean;
};

const AyahTafsir: NextPage<AyahTafsirProp> = ({ hasError, chapter, tafsirData }) => {
  const { t, lang } = useTranslation('common');
  const router = useRouter();
  const {
    query: { verseId, chapterId },
  } = router;
  if (hasError) {
    return <Error statusCode={500} />;
  }
  const description = tafsirData?.tafsir.text ? stripHTMLTags(tafsirData.tafsir.text) : null;
  const path = getVerseTafsirNavigationUrl(chapter.chapter.slug, Number(verseId));

  return (
    <>
      <NextSeoWrapper
        title={`${t('tafsir.surah')} ${chapter.chapter.transliteratedName} - ${toLocalizedNumber(
          Number(verseId),
          lang,
        )}`}
        canonical={getCanonicalUrl(lang, path)}
        languageAlternates={getLanguageAlternates(path)}
        {...(description && { description })} // some verses won't have Tafsirs so we cannot set the description in that case
      />
      <div className={styles.tafsirContainer}>
        <TafsirBody
          initialChapterId={chapterId.toString()}
          initialVerseNumber={verseId.toString()}
          initialTafsirData={tafsirData}
          initialTafsirIdOrSlug={router.query.tafsirId ? Number(router.query.tafsirId) : undefined}
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
    const tafsirData = await fetcher<TafsirContentResponse>(
      makeTafsirContentUrl(
        getTafsirsInitialState(locale).selectedTafsirs[0],
        makeVerseKey(Number(chapterIdOrSlug), Number(verseId)),
        {
          words: true,
          ...getDefaultWordFields(),
        },
      ),
    );

    if (!chapterData) return notFoundResponse;

    return {
      props: {
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

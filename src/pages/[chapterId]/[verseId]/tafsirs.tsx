/* eslint-disable react-func/max-lines-per-function */
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';

import styles from './tafsirs.module.scss';

import { getChapterIdBySlug, getChapterVerses, fetcher } from 'src/api';
import NextSeoWrapper from 'src/components/NextSeoWrapper';
// import QuranReader from 'src/components/QuranReader';
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
import { isValidChapterId, isValidVerseId } from 'src/utils/validator';
import { ChapterResponse, TafsirsResponse, VersesResponse } from 'types/ApiResponses';
// import { QuranReaderDataType } from 'types/QuranReader';

type AyahTafsirProp = {
  chapter?: ChapterResponse;
  verses?: VersesResponse;
  tafsirData?: TafsirsResponse;
  hasError?: boolean;
};

const AyahTafsir: NextPage<AyahTafsirProp> = ({ hasError, chapter, verses, tafsirData }) => {
  const { t, lang } = useTranslation('common');
  const router = useRouter();
  const {
    query: { verseId, chapterId },
  } = router;
  if (hasError) {
    return <Error statusCode={500} />;
  }
  const description =
    verses.verses[0].tafsirs && verses.verses[0].tafsirs.length
      ? stripHTMLTags(verses.verses[0].tafsirs[0].text)
      : null;
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
          initialTafsirIds={router.query.tafsirId ? [Number(router.query.tafsiirId)] : undefined}
        />
      </div>
      {/* <QuranReader
        initialData={verses}
        id={chapter.chapter.id}
        quranReaderDataType={QuranReaderDataType.Tafsir}
      /> */}
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  let chapterIdOrSlug = String(params.chapterId);
  const verseId = String(params.verseId);
  // we need to validate the chapterId and verseId first to save calling BE since we haven't set the valid paths inside getStaticPaths to avoid pre-rendering them at build time.
  if (!isValidChapterId(chapterIdOrSlug) || !isValidVerseId(chapterIdOrSlug, verseId)) {
    const sluggedChapterId = await getChapterIdBySlug(chapterIdOrSlug, locale);
    // if it's not a valid slug
    if (!sluggedChapterId) {
      return { notFound: true };
    }
    chapterIdOrSlug = sluggedChapterId;
  }

  const versesResponse = await getChapterVerses(chapterIdOrSlug, locale, {
    page: verseId, // we pass the verse id as a the page and then fetch only 1 verse per page.
    perPage: 1, // only 1 verse per page
    translations: null,
    wordFields: 'location, verse_key, text_uthmani',
  });
  // if the chapter or verses APIs failed

  const chapterData = getChapterData(chapterIdOrSlug, locale);

  const tafsirData = await fetcher(
    // @ts-ignore
    makeTafsirContentUrl(getTafsirsInitialState(locale).selectedTafsirs[0], verseId, {
      words: true,
      ...getDefaultWordFields(),
    }),
  );

  if (versesResponse.status === 500 || !chapterData) {
    return {
      props: {
        hasError: true,
      },
      revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS, // 35 seconds will be enough time before we re-try generating the page again.
    };
  }
  return {
    props: {
      tafsirData,
      chapter: {
        chapter: { ...chapterData, id: chapterIdOrSlug },
      },
      verses: versesResponse,
    },
    revalidate: ONE_WEEK_REVALIDATION_PERIOD_SECONDS, // verses will be generated at runtime if not found in the cache, then cached for subsequent requests for 7 days.
  };
};
export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [], // no pre-rendered chapters at build time.
  fallback: 'blocking', // will server-render pages on-demand if the path doesn't exist.
});

export default AyahTafsir;

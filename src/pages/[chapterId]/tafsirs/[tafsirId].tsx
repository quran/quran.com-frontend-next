/* eslint-disable react-func/max-lines-per-function */
import React from 'react';

import { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import useTranslation from 'next-translate/useTranslation';

import styles from '../[verseId]/tafsirs.module.scss';

import { getTafsirContent } from 'src/api';
import NextSeoWrapper from 'src/components/NextSeoWrapper';
import TafsirBody from 'src/components/QuranReader/TafsirView/TafsirBody';
import Error from 'src/pages/_error';
import { getQuranReaderStylesInitialState } from 'src/redux/defaultSettings/util';
import { getChapterData } from 'src/utils/chapter';
import { getLanguageAlternates, toLocalizedNumber } from 'src/utils/locale';
import {
  getCanonicalUrl,
  getVerseSelectedTafsirNavigationUrl,
  scrollWindowToTop,
} from 'src/utils/navigation';
import {
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
} from 'src/utils/staticPageGeneration';
import { isValidVerseKey } from 'src/utils/validator';
import { getVerseAndChapterNumbersFromKey } from 'src/utils/verse';
import { ChapterResponse, TafsirContentResponse } from 'types/ApiResponses';

type AyahTafsirProp = {
  chapter?: ChapterResponse;
  hasError?: boolean;
  verseNumber?: string;
  tafsirIdOrSlug?: string;
  chapterId?: string;
  tafsirData?: TafsirContentResponse;
};

const SelectedTafsirOfAyah: NextPage<AyahTafsirProp> = ({
  hasError,
  chapter,
  verseNumber,
  chapterId,
  tafsirData,
  tafsirIdOrSlug,
}) => {
  const { t, lang } = useTranslation('common');
  if (hasError) {
    return <Error statusCode={500} />;
  }

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
        canonical={getCanonicalUrl(lang, navigationUrl)}
        description={t('tafsir.tafsir-desc', {
          verseNumber: localizedVerseNumber,
          tafsirName: tafsirData.tafsir.translatedName.name,
          surahName: chapter.chapter.transliteratedName,
        })}
        languageAlternates={getLanguageAlternates(navigationUrl)}
      />
      <div className={styles.tafsirContainer}>
        <TafsirBody
          shouldRender
          scrollToTop={scrollWindowToTop}
          initialChapterId={chapterId}
          initialVerseNumber={verseNumber.toString()}
          initialTafsirData={tafsirData}
          initialTafsirIdOrSlug={tafsirIdOrSlug || undefined}
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

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const { chapterId, tafsirId: tafsirIdOrSlug } = params;
  const verseKey = String(chapterId);
  // if the verse key or the tafsir id is not valid
  if (!isValidVerseKey(verseKey)) {
    return { notFound: true };
  }
  const [chapterNumber, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
  const { quranFont, mushafLines } = getQuranReaderStylesInitialState(locale);
  try {
    const tafsirData = await getTafsirContent(
      tafsirIdOrSlug as string,
      verseKey,
      quranFont,
      mushafLines,
      locale,
    );
    return {
      props: {
        chapterId: chapterNumber,
        tafsirData,
        chapter: { chapter: getChapterData(chapterNumber, locale) },
        verseNumber,
        tafsirIdOrSlug,
      },
      revalidate: ONE_WEEK_REVALIDATION_PERIOD_SECONDS, // verses will be generated at runtime if not found in the cache, then cached for subsequent requests for 7 days.
    };
  } catch (error) {
    return {
      props: { hasError: true },
      revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS, // 35 seconds will be enough time before we re-try generating the page again.
    };
  }
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [], // no pre-rendered chapters at build time.
  fallback: 'blocking', // will server-render pages on-demand if the path doesn't exist.
});

export default SelectedTafsirOfAyah;

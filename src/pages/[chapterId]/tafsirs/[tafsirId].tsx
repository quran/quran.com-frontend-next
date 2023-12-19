/* eslint-disable react-func/max-lines-per-function */
import React from 'react';

import { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { SWRConfig } from 'swr';

import styles from '../[verseId]/tafsirs.module.scss';

import { fetcher } from '@/api';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import TafsirBody from '@/components/QuranReader/TafsirView/TafsirBody';
import { getChapterOgImageUrl } from '@/lib/og';
import Error from '@/pages/_error';
import { getQuranReaderStylesInitialState } from '@/redux/defaultSettings/util';
import { makeTafsirContentUrl, makeTafsirsUrl } from '@/utils/apiPaths';
import { getAllChaptersData, getChapterData } from '@/utils/chapter';
import { getLanguageAlternates, toLocalizedNumber } from '@/utils/locale';
import {
  getCanonicalUrl,
  getVerseSelectedTafsirNavigationUrl,
  scrollWindowToTop,
} from '@/utils/navigation';
import {
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
} from '@/utils/staticPageGeneration';
import { isValidVerseKey } from '@/utils/validator';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';
import { ChapterResponse, TafsirContentResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';

type AyahTafsirProp = {
  chapter?: ChapterResponse;
  hasError?: boolean;
  verseNumber?: string;
  tafsirIdOrSlug?: string;
  chapterId?: string;
  tafsirData?: TafsirContentResponse;
  chaptersData: ChaptersData;
  fallback: any;
};

const SelectedTafsirOfAyah: NextPage<AyahTafsirProp> = ({
  hasError,
  chapter,
  verseNumber,
  chapterId,
  tafsirData,
  tafsirIdOrSlug,
  fallback,
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
        <div className={styles.tafsirContainer}>
          <TafsirBody
            shouldRender
            scrollToTop={scrollWindowToTop}
            initialChapterId={chapterId}
            initialVerseNumber={verseNumber.toString()}
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
  try {
    const tafsirContentUrl = makeTafsirContentUrl(tafsirIdOrSlug as string, verseKey, {
      lang: locale,
      quranFont,
      mushafLines,
    });
    const tafsirListUrl = makeTafsirsUrl(locale);

    const [tafsirContentData, tafsirListData] = await Promise.all([
      fetcher(tafsirContentUrl),
      fetcher(tafsirListUrl),
    ]);

    return {
      props: {
        chaptersData,
        chapterId: chapterNumber,
        chapter: { chapter: getChapterData(chaptersData, chapterNumber) },
        fallback: {
          [tafsirListUrl]: tafsirListData,
          [tafsirContentUrl]: tafsirContentData,
        },
        tafsirData: tafsirContentData,
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

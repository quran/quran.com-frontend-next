/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import React from 'react';

import { NextPage, GetServerSideProps } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { SWRConfig } from 'swr';

import styles from '../[verseId]/tafsirs.module.scss';

import { fetcher } from '@/api';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import TafsirBody from '@/components/QuranReader/TafsirView/TafsirBody';
import { getChapterOgImageUrl } from '@/lib/og';
import { logErrorToSentry } from '@/lib/sentry';
import { getQuranReaderStylesInitialState } from '@/redux/defaultSettings/util';
import Language from '@/types/Language';
import { makeTafsirContentUrl, makeTafsirsUrl } from '@/utils/apiPaths';
import { getAllChaptersData, getChapterData } from '@/utils/chapter';
import { getLanguageAlternates, toLocalizedNumber } from '@/utils/locale';
import {
  getCanonicalUrl,
  getVerseSelectedTafsirNavigationUrl,
  scrollWindowToTop,
} from '@/utils/navigation';
import { isValidVerseKey } from '@/utils/validator';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';
import withSsrRedux from '@/utils/withSsrRedux';
import { ChapterResponse, TafsirContentResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';

type AyahTafsirProp = {
  chapter?: ChapterResponse;
  verseNumber?: string;
  tafsirIdOrSlug?: string;
  chapterId?: string;
  tafsirData?: TafsirContentResponse;
  chaptersData: ChaptersData;
  fallback: any;
};

const AyahTafsirPage: NextPage<AyahTafsirProp> = ({
  chapter,
  verseNumber,
  chapterId,
  tafsirData,
  tafsirIdOrSlug,
  fallback,
}) => {
  const { t, lang } = useTranslation('common');

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

export const getServerSideProps: GetServerSideProps = withSsrRedux(
  '/[chapterId]/tafsirs/[tafsirId]',
  async (context) => {
    const { params, locale } = context;
    const { chapterId, tafsirId: tafsirIdOrSlug } = params;
    const verseKey = String(chapterId);
    const chaptersData = await getAllChaptersData(locale);
    if (!isValidVerseKey(chaptersData, verseKey)) {
      return { notFound: true };
    }
    const [chapterNumber, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
    const { quranFont, mushafLines } = getQuranReaderStylesInitialState(locale as Language);
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
      };
    } catch (error) {
      logErrorToSentry(error, {
        transactionName: 'getServerSideProps-TafsirPage',
        metadata: {
          chapterIdOrSlug: String(params.chapterId),
          tafsirIdOrSlug: String(params.tafsirId),
          locale,
        },
      });
      return { notFound: true };
    }
  },
);

export default AyahTafsirPage;

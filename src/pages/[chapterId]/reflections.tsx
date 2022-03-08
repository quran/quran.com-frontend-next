import React from 'react';

import { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import useTranslation from 'next-translate/useTranslation';

import styles from './[verseId]/tafsirs.module.scss';

import getReflectionData from 'src/api';
import NextSeoWrapper from 'src/components/NextSeoWrapper';
import ReflectionBody from 'src/components/QuranReader/ReflectionView/ReflectionBody';
import Error from 'src/pages/_error';
import { DEFAULT_TRANSLATIONS } from 'src/redux/defaultSettings/defaultSettings';
import { getQuranReaderStylesInitialState } from 'src/redux/defaultSettings/util';
import { getChapterData } from 'src/utils/chapter';
import { toLocalizedNumber } from 'src/utils/locale';
import { scrollWindowToTop } from 'src/utils/navigation';
import {
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
} from 'src/utils/staticPageGeneration';
import { isValidVerseKey } from 'src/utils/validator';
import { getVerseAndChapterNumbersFromKey } from 'src/utils/verse';
import { ChapterResponse } from 'types/ApiResponses';

type AyahTafsirProp = {
  chapter?: ChapterResponse;
  hasError?: boolean;
  verseNumber?: string;
  chapterId?: string;
  initialData?: any;
};

const SelectedTafsirOfAyah: NextPage<AyahTafsirProp> = ({
  hasError,
  chapter,
  verseNumber,
  chapterId,
  initialData,
}) => {
  const { t, lang } = useTranslation('common');
  if (hasError) {
    return <Error statusCode={500} />;
  }

  return (
    <>
      <NextSeoWrapper
        title={`${t('reflect')} ${chapter.chapter.transliteratedName} - ${toLocalizedNumber(
          Number(verseNumber),
          lang,
        )}`}
      />
      <div className={styles.tafsirContainer}>
        <ReflectionBody
          scrollToTop={scrollWindowToTop}
          initialChapterId={chapterId}
          initialVerseNumber={verseNumber.toString()}
          initialData={initialData}
          render={({ body, surahAndAyahSelection }) => {
            return (
              <div>
                {surahAndAyahSelection}
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
  const { chapterId } = params;
  const verseKey = String(chapterId);
  // if the verse key or the tafsir id is not valid
  if (!isValidVerseKey(verseKey)) {
    return { notFound: true };
  }
  const [chapterNumber, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
  const { quranFont, mushafLines } = getQuranReaderStylesInitialState(locale);
  try {
    const data = await getReflectionData({
      chapterId: chapterNumber,
      mushafLines,
      quranFont,
      translation: DEFAULT_TRANSLATIONS[0],
      verseNumber,
    });
    return {
      props: {
        chapterId: chapterNumber,
        chapter: { chapter: getChapterData(chapterNumber, locale) },
        verseNumber,
        initialData: data,
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

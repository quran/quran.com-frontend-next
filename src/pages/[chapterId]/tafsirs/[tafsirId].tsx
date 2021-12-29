import React from 'react';

import { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import useTranslation from 'next-translate/useTranslation';

import styles from '../[verseId]/tafsirs.module.scss';

import { fetcher } from 'src/api';
import NextSeoWrapper from 'src/components/NextSeoWrapper';
import TafsirBody from 'src/components/QuranReader/TafsirView/TafsirBody';
import Error from 'src/pages/_error';
import { getDefaultWordFields } from 'src/utils/api';
import { makeTafsirContentUrl } from 'src/utils/apiPaths';
import { getChapterData } from 'src/utils/chapter';
import { toLocalizedNumber } from 'src/utils/locale';
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

  return (
    <>
      <NextSeoWrapper
        title={`${t('tafsir.surah')} ${chapter.chapter.transliteratedName} - ${toLocalizedNumber(
          Number(verseNumber),
          lang,
        )}`}
      />
      <div className={styles.tafsirContainer}>
        <TafsirBody
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
  try {
    const tafsirData = await fetcher<TafsirContentResponse>(
      makeTafsirContentUrl(tafsirIdOrSlug as string, verseKey, {
        words: true,
        ...getDefaultWordFields(),
      }),
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

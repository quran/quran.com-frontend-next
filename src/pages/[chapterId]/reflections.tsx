/* eslint-disable react-func/max-lines-per-function */
import React from 'react';

import { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { SWRConfig } from 'swr';

import styles from './[verseId]/tafsirs.module.scss';

import { fetcher } from 'src/api';
import NextSeoWrapper from 'src/components/NextSeoWrapper';
import ReflectionBodyContainer from 'src/components/QuranReader/ReflectionView/ReflectionBodyContainer';
import Error from 'src/pages/_error';
import {
  getQuranReaderStylesInitialState,
  getTranslationsInitialState,
} from 'src/redux/defaultSettings/util';
import { getDefaultWordFields, getMushafId } from 'src/utils/api';
import { makeVerseReflectionsUrl, makeVersesUrl } from 'src/utils/apiPaths';
import { getChapterData } from 'src/utils/chapter';
import { getLanguageAlternates, toLocalizedNumber } from 'src/utils/locale';
import {
  getCanonicalUrl,
  getVerseReflectionNavigationUrl,
  scrollWindowToTop,
} from 'src/utils/navigation';
import {
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
} from 'src/utils/staticPageGeneration';
import { isValidVerseKey } from 'src/utils/validator';
import { getVerseAndChapterNumbersFromKey } from 'src/utils/verse';
import { ChapterResponse } from 'types/ApiResponses';

type AyahReflectionProp = {
  chapter?: ChapterResponse;
  hasError?: boolean;
  verseNumber?: string;
  chapterId?: string;
  fallback?: any;
};

const SelectedAyahReflection: NextPage<AyahReflectionProp> = ({
  hasError,
  chapter,
  verseNumber,
  chapterId,
  fallback,
}) => {
  const { t, lang } = useTranslation('quran-reader');
  if (hasError) {
    return <Error statusCode={500} />;
  }

  const navigationUrl = getVerseReflectionNavigationUrl(`${chapterId}:${verseNumber}`);

  return (
    <>
      <NextSeoWrapper
        title={`${t('common:reflect')} ${chapter.chapter.transliteratedName} - ${toLocalizedNumber(
          Number(verseNumber),
          lang,
        )}`}
        canonical={getCanonicalUrl(lang, navigationUrl)}
        languageAlternates={getLanguageAlternates(navigationUrl)}
        description={t('reflections-desc', {
          ayahNumber: verseNumber,
          surahName: chapter.chapter.transliteratedName,
        })}
      />
      <SWRConfig value={{ fallback }}>
        <div className={styles.tafsirContainer}>
          <ReflectionBodyContainer
            scrollToTop={scrollWindowToTop}
            initialChapterId={chapterId}
            initialVerseNumber={verseNumber.toString()}
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
      </SWRConfig>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const { chapterId } = params;
  const verseKey = String(chapterId);
  if (!isValidVerseKey(verseKey)) {
    return { notFound: true };
  }
  const [chapterNumber, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
  const { quranFont, mushafLines } = getQuranReaderStylesInitialState(locale);
  const translations = getTranslationsInitialState(locale).selectedTranslations;
  try {
    const verseReflectionUrl = makeVerseReflectionsUrl(chapterNumber, verseNumber, locale);

    const mushafId = getMushafId(quranFont, mushafLines).mushaf;
    const apiParams = {
      ...getDefaultWordFields(quranFont),
      translationFields: 'resource_name,language_id',
      translations: translations.join(','),
      mushaf: mushafId,
      from: `${chapterNumber}:${verseNumber}`,
      to: `${chapterNumber}:${verseNumber}`,
    };

    const versesUrl = makeVersesUrl(chapterNumber, locale, apiParams);

    const [verseReflectionsData, versesData] = await Promise.all([
      fetcher(verseReflectionUrl),
      fetcher(versesUrl),
    ]);

    const fallback = {
      [verseReflectionUrl]: verseReflectionsData,
      [versesUrl]: versesData,
    };

    return {
      props: {
        chapterId: chapterNumber,
        chapter: { chapter: getChapterData(chapterNumber, locale) },
        verseNumber,
        fallback,
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

export default SelectedAyahReflection;

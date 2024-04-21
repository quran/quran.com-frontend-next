/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import React from 'react';

import { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { SWRConfig } from 'swr';

import { fetcher } from '@/api';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import ReflectionBodyContainer from '@/components/QuranReader/ReflectionView/ReflectionBodyContainer';
import { getChapterOgImageUrl } from '@/lib/og';
import Error from '@/pages/_error';
import layoutStyle from '@/pages/index.module.scss';
import {
  getQuranReaderStylesInitialState,
  getTranslationsInitialState,
} from '@/redux/defaultSettings/util';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { makeVersesUrl } from '@/utils/apiPaths';
import { getChapterData, getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates, toLocalizedNumber } from '@/utils/locale';
import {
  getCanonicalUrl,
  getVerseReflectionNavigationUrl,
  scrollWindowToTop,
} from '@/utils/navigation';
import { getAyahReflections, makeAyahReflectionsUrl } from '@/utils/quranReflect/apiPaths';
import {
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
} from '@/utils/staticPageGeneration';
import { isValidVerseKey } from '@/utils/validator';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';
import { ChapterResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';

type AyahReflectionProp = {
  chapter?: ChapterResponse;
  hasError?: boolean;
  verseNumber?: string;
  chapterId?: string;
  chaptersData: ChaptersData;
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
        title={`${chapter.chapter.transliteratedName} - ${toLocalizedNumber(
          Number(verseNumber),
          lang,
        )} ${t('common:reflections')} `}
        image={getChapterOgImageUrl({
          chapterId,
          verseNumber,
          locale: lang,
        })}
        imageWidth={1200}
        imageHeight={630}
        canonical={getCanonicalUrl(lang, navigationUrl)}
        languageAlternates={getLanguageAlternates(navigationUrl)}
        description={t('reflections-desc', {
          ayahNumber: verseNumber,
          surahName: chapter.chapter.transliteratedName,
        })}
      />
      {/* @ts-ignore */}
      <SWRConfig value={{ fallback }}>
        <div className={layoutStyle.pageContainer}>
          <div className={layoutStyle.flow}>
            <div className={layoutStyle.flowItem}>
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
          </div>
        </div>
      </SWRConfig>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const { chapterId } = params;
  const verseKey = String(chapterId);
  const chaptersData = await getAllChaptersData(locale);
  if (!isValidVerseKey(chaptersData, verseKey)) {
    return { notFound: true };
  }
  const [chapterNumber, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
  const { quranFont, mushafLines } = getQuranReaderStylesInitialState(locale);
  const translations = getTranslationsInitialState(locale).selectedTranslations;
  try {
    const verseReflectionUrl = makeAyahReflectionsUrl({
      surahId: chapterNumber,
      ayahNumber: verseNumber,
      locale,
    });

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
      getAyahReflections(verseReflectionUrl),
      fetcher(versesUrl),
    ]);

    const fallback = {
      [verseReflectionUrl]: verseReflectionsData,
      [versesUrl]: versesData,
    };

    return {
      props: {
        chaptersData,
        chapterId: chapterNumber,
        chapter: { chapter: getChapterData(chaptersData, chapterNumber) },
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

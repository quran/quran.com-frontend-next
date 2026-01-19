/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import React from 'react';

import { NextPage, GetServerSideProps } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { SWRConfig } from 'swr';

import { fetcher } from '@/api';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import ReflectionBodyContainer from '@/components/QuranReader/ReflectionView/ReflectionBodyContainer';
import { getChapterOgImageUrl } from '@/lib/og';
import { logErrorToSentry } from '@/lib/sentry';
import layoutStyle from '@/pages/index.module.scss';
import {
  getQuranReaderStylesInitialState,
  getTranslationsInitialState,
} from '@/redux/defaultSettings/util';
import Language from '@/types/Language';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { makeVersesUrl } from '@/utils/apiPaths';
import { getChapterData, getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates, toLocalizedNumber } from '@/utils/locale';
import {
  getCanonicalUrl,
  getVerseReflectionNavigationUrl,
  scrollWindowToTop,
} from '@/utils/navigation';
import {
  getAyahReflections,
  makeAyahReflectionsUrl,
  REFLECTION_POST_TYPE_ID,
} from '@/utils/quranReflect/apiPaths';
import { isValidVerseKey } from '@/utils/validator';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';
import withSsrRedux from '@/utils/withSsrRedux';
import { ChapterResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';
import AyahReflectionsResponse from 'types/QuranReflect/AyahReflectionsResponse';

type AyahReflectionProp = {
  chapter?: ChapterResponse;
  verseNumber?: string;
  chapterId?: string;
  chaptersData: ChaptersData;
  fallback?: any;
  initialAyahReflections?: AyahReflectionsResponse;
};

const ReflectionsPage: NextPage<AyahReflectionProp> = ({
  chapter,
  verseNumber,
  chapterId,
  fallback,
  initialAyahReflections,
}) => {
  const { t, lang } = useTranslation('quran-reader');

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
                initialAyahReflections={initialAyahReflections}
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

export const getServerSideProps: GetServerSideProps = withSsrRedux(
  '/[chapterId]/reflections',
  async (context) => {
    const { params, locale } = context;
    const { chapterId } = params;
    const verseKey = String(chapterId);
    const chaptersData = await getAllChaptersData(locale);
    if (!isValidVerseKey(chaptersData, verseKey)) {
      return { notFound: true };
    }
    const [chapterNumber, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
    const { quranFont, mushafLines } = getQuranReaderStylesInitialState(locale as Language);
    const translations = getTranslationsInitialState(locale as Language).selectedTranslations;
    try {
      const verseReflectionUrl = makeAyahReflectionsUrl({
        surahId: chapterNumber,
        ayahNumber: verseNumber,
        locale,
        postTypeIds: [REFLECTION_POST_TYPE_ID],
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
          initialAyahReflections: verseReflectionsData,
        },
      };
    } catch (error) {
      logErrorToSentry(error, {
        transactionName: 'getServerSideProps-ReflectionsPage',
        metadata: {
          chapterIdOrSlug: String(params.chapterId),
          locale,
        },
      });
      return { notFound: true };
    }
  },
);

export default ReflectionsPage;

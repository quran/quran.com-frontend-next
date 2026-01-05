/* eslint-disable react-func/max-lines-per-function */
import React from 'react';

import type { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import useTranslation from 'next-translate/useTranslation';

import {
  DEFAULT_RECITER,
  DEFAULT_VERSE,
  WidgetInputError,
  getAyahWidgetData,
} from '@/components/AyahWidget/getAyahWidgetData';
import {
  parseBool,
  parseNumber,
  parseString,
  parseVersesParam,
} from '@/components/AyahWidget/queryParsing';
import QuranWidget from '@/components/AyahWidget/QuranWidget';
import useWidgetInteractions from '@/hooks/widget/useWidgetInteractions';
import ThemeType from '@/redux/types/ThemeType';
import type { MushafType, WidgetOptions } from '@/types/ayah-widget';
import { isMushafType } from '@/types/ayah-widget';
import type Verse from 'types/Verse';

type EmbedProps = {
  verses?: Verse[];
  options?: WidgetOptions;
  error?: string;
};

/**
 * Embed page for the Ayah widget, rendered inside an iframe.
 * @param {EmbedProps} props - The props for the component.
 * @returns {JSX.Element} The rendered component.
 */
const EmbedPage = ({ verses, options, error }: EmbedProps): JSX.Element => {
  const { t } = useTranslation('common');

  useWidgetInteractions(options);

  if (!verses?.length || !options) {
    return (
      <div style={{ padding: 24, fontFamily: 'sans-serif' }}>{error || t('error.general')}</div>
    );
  }

  return (
    <>
      <Head>
        <title>{t('quran-com')}</title>
      </Head>

      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          background: transparent;
          overflow-x: hidden;
          overflow-y: auto;
        }
      `}</style>

      <QuranWidget verses={verses} options={options} />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<EmbedProps> = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<EmbedProps>> => {
  const { query, res } = context;

  try {
    const versesParam = parseString(query.verses);
    const ayahParam = parseString(query.ayah);

    let ayah = ayahParam || DEFAULT_VERSE;
    let rangeEnd: number | undefined;

    if (versesParam) {
      ({ ayah, rangeEnd } = parseVersesParam(versesParam));
    } else {
      rangeEnd = parseNumber(parseString(query.rangeEnd));
    }

    const translationIdsQuery = parseString(query.translations) ?? '';
    const translationIds = translationIdsQuery
      .split(',')
      .map((id) => Number(id.trim()))
      .filter((id) => Number.isFinite(id));
    const uniqueTranslationIds = Array.from(new Set(translationIds));

    const reciter = parseString(query.reciter) || DEFAULT_RECITER;
    const enableAudio = parseBool(query.audio, true);
    const enableWbw = parseBool(query.wbw);

    const themeParam = parseString(query.theme);
    const theme: WidgetOptions['theme'] =
      themeParam === ThemeType.Dark || themeParam === ThemeType.Sepia
        ? themeParam
        : ThemeType.Light;

    const mushafParam = parseString(query.mushaf);
    const mushaf: MushafType = isMushafType(mushafParam) ? mushafParam : 'qpc';

    const showTranslatorNames = parseBool(
      (query.showTranslationName ?? query.showTranslatorNames) as string | string[] | undefined,
      false,
    );
    const showArabic = parseBool(query.showArabic as string | string[] | undefined, true);
    const showTafsirs = parseBool(
      (query.tafsir ?? query.showTafsirs) as string | string[] | undefined,
      true,
    );
    const showReflections = parseBool(
      (query.reflections ?? query.showReflections) as string | string[] | undefined,
      true,
    );
    const showAnswers = parseBool(
      (query.answers ?? query.showAnswers) as string | string[] | undefined,
      true,
    );

    const locale = parseString(query.locale);
    const customWidth = parseString(query.width) || undefined;
    const customHeight = parseString(query.height) || undefined;

    const data = await getAyahWidgetData({
      ayah,
      translationIds: uniqueTranslationIds,
      reciter,
      enableAudio,
      enableWbw,
      theme,
      mushaf,
      showTranslatorNames,
      showArabic,
      showTafsirs,
      showReflections,
      showAnswers,
      locale: locale || undefined,
      rangeEnd,
      customWidth,
      customHeight,
    });

    const serializable = JSON.parse(JSON.stringify({ verses: data.verses, options: data.options }));

    return {
      props: {
        verses: serializable.verses,
        options: serializable.options,
      },
    };
  } catch (error) {
    if (error instanceof WidgetInputError) {
      if (res) res.statusCode = error.status;
      return { props: { error: error.message } };
    }

    if (res) res.statusCode = 500;
    return { props: {} };
  }
};

export default EmbedPage;

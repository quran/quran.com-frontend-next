/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import React from 'react';

import { randomUUID } from 'crypto';

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
import useEmbedAutoResize from '@/hooks/widget/useEmbedAutoResize';
import useWidgetInteractions from '@/hooks/widget/useWidgetInteractions';
import ThemeType from '@/redux/types/ThemeType';
import type { MushafType, WidgetOptions } from '@/types/Embed';
import { isMushafType } from '@/types/Embed';
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
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  useWidgetInteractions(options);
  useEmbedAutoResize(containerRef);

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
          width: 100%;
        }
      `}</style>

      <div
        ref={containerRef}
        id="quran-embed-root"
        style={{
          width: '100%',
        }}
      >
        <QuranWidget verses={verses} options={options} />
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<EmbedProps> = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<EmbedProps>> => {
  const { query, req, res } = context;

  // Get referer header (the page hosting the iframe)
  const referer = req.headers.referer || req.headers.origin || '';
  const embedViewId = randomUUID();

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
    const enableWbwTransliteration = parseBool(query.wbwTransliteration);

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
    const showLessons = parseBool(
      (query.lessons ?? query.showLessons) as string | string[] | undefined,
      true,
    );
    const showAnswers = parseBool(
      (query.answers ?? query.showAnswers) as string | string[] | undefined,
      true,
    );

    const locale = parseString(query.locale);
    const customWidth = parseString(query.width) || undefined;
    const customHeight = parseString(query.height) || undefined;
    const mergeVerses = parseBool(query.mergeVerses as string | string[] | undefined, false);
    const clientId = parseString(query.clientId) || undefined;
    const lpMode = parseBool(query.lp as string | string[] | undefined, false);

    const data = await getAyahWidgetData({
      ayah,
      translationIds: uniqueTranslationIds,
      reciter,
      enableAudio,
      enableWbw,
      enableWbwTransliteration,
      theme,
      mushaf,
      showTranslatorNames,
      showArabic,
      showTafsirs,
      showReflections,
      showLessons,
      showAnswers,
      locale: locale || undefined,
      rangeEnd,
      mergeVerses,
      customWidth,
      customHeight,
      clientId,
      referer: String(referer),
      embedViewId,
      lp: lpMode,
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

/* eslint-disable react-func/max-lines-per-function */
import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';

import { getRangeVerses } from '@/api';
import EmbedContainer from '@/components/Embed/EmbedContainer';
import { logErrorToSentry } from '@/lib/sentry';
import { MushafLines } from '@/types/QuranReader';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { getAllChaptersData, getChapterData } from '@/utils/chapter';
import { parseEmbedConfig, DEFAULT_EMBED_CONFIG } from '@/utils/embed';
import { EmbedConfig, EmbedQueryParams } from 'types/Embed';
import Verse from 'types/Verse';

interface EmbedPageProps {
  verses: Verse[];
  config: EmbedConfig;
  chapterName?: string;
  error?: string;
}

/**
 * Embed page for displaying Quran verses in an iframe.
 * This page is designed to be embedded on third-party websites.
 *
 * @returns {JSX.Element} The embed page
 */
const EmbedPage: NextPage<EmbedPageProps> = ({ verses, config, chapterName, error }) => {
  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
        <style>{`
          html, body {
            margin: 0;
            padding: 0;
            background: transparent;
            overflow-x: hidden;
          }
        `}</style>
      </Head>
      <EmbedContainer verses={verses} config={config} chapterName={chapterName} error={error} />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<EmbedPageProps> = async ({ query, locale }) => {
  const queryParams = query as unknown as EmbedQueryParams;

  // Validate required parameters
  if (!queryParams.verses) {
    return {
      props: {
        verses: [],
        config: DEFAULT_EMBED_CONFIG,
        error: 'Missing required parameter: verses',
      },
    };
  }

  const config = parseEmbedConfig(queryParams, locale);

  // parseEmbedConfig returns null for invalid verse format
  if (!config) {
    return {
      props: {
        verses: [],
        config: DEFAULT_EMBED_CONFIG,
        error: 'Invalid verse format. Use format: chapter:verse or chapter:from-to',
      },
    };
  }

  try {
    const chaptersData = await getAllChaptersData(config.locale);
    const chapterData = getChapterData(chaptersData, config.chapterId.toString());

    if (!chapterData) {
      return {
        props: {
          verses: [],
          config,
          error: 'Chapter not found',
        },
      };
    }

    // Validate verse range against chapter data
    if (config.toVerse > chapterData.versesCount) {
      return {
        props: {
          verses: [],
          config,
          error: `Invalid verse range. Chapter ${config.chapterId} has ${chapterData.versesCount} verses`,
        },
      };
    }

    const fromVerseKey = `${config.chapterId}:${config.fromVerse}`;
    const toVerseKey = `${config.chapterId}:${config.toVerse}`;
    const mushafId = getMushafId(config.quranFont, MushafLines.SixteenLines).mushaf;

    const apiParams = {
      ...getDefaultWordFields(config.quranFont),
      mushaf: mushafId,
      from: fromVerseKey,
      to: toVerseKey,
      perPage: 'all',
      translations: config.translations.join(','),
    };

    const versesResponse = await getRangeVerses(config.locale, apiParams);

    if (!versesResponse.verses || versesResponse.verses.length === 0) {
      return { props: { verses: [], config, error: 'Verses not found' } };
    }

    return {
      props: {
        verses: versesResponse.verses,
        config,
        chapterName: chapterData.transliteratedName,
      },
    };
  } catch (err) {
    logErrorToSentry(err, {
      transactionName: 'getServerSideProps-EmbedPage',
      metadata: { query: JSON.stringify(query), locale },
    });

    return { props: { verses: [], config, error: 'Failed to load verses' } };
  }
};

export default EmbedPage;

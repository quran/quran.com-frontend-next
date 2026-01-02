/* eslint-disable max-lines */
import React from 'react';

import type { NextApiRequest, NextApiResponse } from 'next';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  DEFAULT_RECITER,
  DEFAULT_VERSE,
  WidgetInputError,
  getAyahWidgetData,
} from '@/components/AyahWidget/getAyahWidgetData';
import QuranWidget from '@/components/AyahWidget/QuranWidget';
import ThemeType from '@/redux/types/ThemeType';
import type { MushafType, WidgetOptions } from '@/types/ayah-widget';
import { isMushafType } from '@/types/ayah-widget';

/**
 * The response type for the Ayah Widget API.
 */
type WidgetResponse =
  | {
      success: true;
      html: string;
    }
  | {
      success: false;
      error: string;
      html: string;
    };

/**
 * Parse a boolean value from a string or array of strings.
 * @param {string | string[] | undefined} value The value to parse.
 * @param {boolean} defaultValue The default value to return if parsing fails.
 * @returns {boolean} The parsed boolean value.
 */
const parseBool = (value: string | string[] | undefined, defaultValue = false): boolean => {
  if (Array.isArray(value)) return parseBool(value[0], defaultValue);
  if (value === undefined) return defaultValue;
  return value === 'true';
};

/**
 * Parse a string value from a string or array of strings.
 * @param {string | string[] | undefined} value The value to parse.
 * @returns {string | undefined} The parsed string value.
 */
const parseString = (value: string | string[] | undefined): string | undefined => {
  if (Array.isArray(value)) return value[0];
  return value;
};

/**
 * Handle the API request for the Ayah widget.
 * @param {NextApiRequest} req The API request.
 * @param {NextApiResponse<WidgetResponse>} res The API response.
 * @returns {Promise<void>}
 */
const handler = async (req: NextApiRequest, res: NextApiResponse<WidgetResponse>) => {
  // Set CORS headers for all responses (success or error)
  const setCorsHeaders = () => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
  };

  const sendError = (status: number, message: string) => {
    setCorsHeaders();
    return res.status(status).json({
      success: false,
      error: message,
      html: `<div>${message}</div>`,
    });
  };

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return sendError(405, 'Method not allowed');
  }

  // Parse query parameters
  const ayah = parseString(req.query.ayah) || DEFAULT_VERSE;
  const translationIdsQuery = parseString(req.query.translations) ?? '';
  const reciter = parseString(req.query.reciter) || DEFAULT_RECITER;
  const enableAudio = parseBool(req.query.audio, true);
  const enableWbw = parseBool(req.query.wbw);
  const themeParam = parseString(req.query.theme);
  const theme: WidgetOptions['theme'] =
    themeParam === ThemeType.Dark || themeParam === ThemeType.Sepia ? themeParam : ThemeType.Light;
  const mushafParam = parseString(req.query.mushaf);
  const mushaf: MushafType = isMushafType(mushafParam) ? mushafParam : 'qpc';
  const showTranslatorNames = parseBool(req.query.showTranslatorNames);
  const showArabic = parseBool(req.query.showArabic, true);
  const showTafsirs = parseBool(req.query.showTafsirs, true);
  const showReflections = parseBool(req.query.showReflections, true);
  const showAnswers = parseBool(req.query.showAnswers, true);
  const locale = parseString(req.query.locale);
  const rangeEndParam = parseString(req.query.rangeEnd);
  const parsedRangeEnd = rangeEndParam ? Number(rangeEndParam) : undefined;
  const normalizedRangeEnd = Number.isFinite(parsedRangeEnd) ? parsedRangeEnd : undefined;
  const customWidth = parseString(req.query.width) || undefined;
  const customHeight = parseString(req.query.height) || undefined;

  // Parse translation IDs
  const translationIdList = translationIdsQuery
    .split(',')
    .map((id) => Number(id.trim()))
    .filter((id) => !Number.isNaN(id));

  try {
    const { verses, options } = await getAyahWidgetData({
      ayah,
      translationIds: translationIdList,
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
      rangeEnd: normalizedRangeEnd,
      customWidth,
      customHeight,
    });

    const html = renderToStaticMarkup(<QuranWidget verses={verses} options={options} />);

    setCorsHeaders();
    res.setHeader('Cache-Control', 'public, max-age=3600');

    // Return the rendered HTML
    return res.status(200).json({ success: true, html });
  } catch (error) {
    if (error instanceof WidgetInputError) {
      return sendError(error.status, error.message);
    }

    setCorsHeaders();
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      html: '<div style="color:red;padding:20px;">Error loading verse. Please try again.</div>',
    });
  }
};

export default handler;

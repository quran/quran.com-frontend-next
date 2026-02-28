import type { NextApiRequest, NextApiResponse } from 'next';

import {
  getAyahWidgetData,
  WidgetInputError,
  AyahWidgetData,
} from '@/components/AyahWidget/getAyahWidgetData';
import ThemeType from '@/redux/types/ThemeType';
import type ThemeTypeVariant from '@/redux/types/ThemeTypeVariant';
import { normalizeQueryParam } from '@/utils/url';

type ApiResponse = AyahWidgetData | { error: string };

const parseTranslationIds = (translations: string | undefined): number[] => {
  if (translations === undefined) return [131];
  return translations
    .split(',')
    .map((id) => Number(id.trim()))
    .filter((id) => Number.isInteger(id) && id > 0);
};

const parseTheme = (theme: string | undefined): ThemeTypeVariant => {
  if (theme === ThemeType.Dark || theme === ThemeType.Sepia) return theme as ThemeTypeVariant;
  return ThemeType.Light;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { chapter, from, to } = req.query;
  const translations = normalizeQueryParam(req.query.translations);
  const theme = normalizeQueryParam(req.query.theme);
  const chapterNum = Number(chapter);
  const fromNum = Number(from);

  if (!Number.isFinite(chapterNum) || !Number.isFinite(fromNum)) {
    return res.status(400).json({ error: 'Invalid chapter or from params' });
  }

  try {
    const data = await getAyahWidgetData({
      ayah: `${chapterNum}:${fromNum}`,
      rangeEnd: to ? Number(to) : undefined,
      translationIds: parseTranslationIds(translations),
      theme: parseTheme(theme),
      locale: normalizeQueryParam(req.query.locale) || 'en',
      lp: true,
      mergeVerses: true,
      showTafsirs: false,
      showReflections: false,
      showLessons: false,
      showAnswers: false,
    });

    return res.status(200).json(data);
  } catch (error) {
    if (error instanceof WidgetInputError) {
      return res.status(error.status).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Failed to fetch verse data' });
  }
}

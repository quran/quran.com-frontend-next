import { useSelector } from 'react-redux';
import useSWR from 'swr';

import i18nConfig from '../../i18n.json';

import type { AyahWidgetData } from '@/components/AyahWidget/getAyahWidgetData';
import { getTranslationsInitialState } from '@/redux/defaultSettings/util';
import { selectTheme } from '@/redux/slices/theme';
import ThemeType from '@/redux/types/ThemeType';
import type { VerseReference } from '@/utils/lessonContentParser';
import { fetcher } from 'src/api';

const resolveTheme = (type: string): string => {
  if (type !== ThemeType.Auto) return type;
  if (typeof window === 'undefined') return ThemeType.Light;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? ThemeType.Dark
    : ThemeType.Light;
};

const useVerseWidgetData = (reference: VerseReference, language = 'en') => {
  const theme = useSelector(selectTheme);
  const safeLanguage = i18nConfig.locales.includes(language) ? language : 'en';
  const translationIds = getTranslationsInitialState(safeLanguage).selectedTranslations;

  const params = new URLSearchParams({
    chapter: String(reference.chapter),
    from: String(reference.from),
    translations: translationIds.join(','),
    theme: resolveTheme(theme.type),
    locale: safeLanguage,
  });

  if (reference.to) params.set('to', String(reference.to));

  const url = `/api/ayah-widget?${params.toString()}`;

  return useSWR<AyahWidgetData>(url, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
};

export default useVerseWidgetData;

import { useSelector } from 'react-redux';
import useSWR from 'swr';

import type { AyahWidgetData } from '@/components/AyahWidget/getAyahWidgetData';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import { selectTheme } from '@/redux/slices/theme';
import ThemeType from '@/redux/types/ThemeType';
import type { VerseReference } from '@/utils/lessonContentParser';
import { fetcher } from 'src/api';

const CLEAR_QURAN_TRANSLATION_ID = 131;

const resolveTheme = (type: string): string => {
  if (type !== ThemeType.Auto) return type;
  if (typeof window === 'undefined') return ThemeType.Light;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? ThemeType.Dark
    : ThemeType.Light;
};

const useVerseWidgetData = (reference: VerseReference) => {
  const selectedTranslations = useSelector(selectSelectedTranslations);
  const theme = useSelector(selectTheme);

  const translationIds =
    selectedTranslations?.length > 0 ? selectedTranslations : [CLEAR_QURAN_TRANSLATION_ID];

  const params = new URLSearchParams({
    chapter: String(reference.chapter),
    from: String(reference.from),
    translations: translationIds.join(','),
    theme: resolveTheme(theme.type),
  });

  if (reference.to) params.set('to', String(reference.to));

  const url = `/api/ayah-widget?${params.toString()}`;

  return useSWR<AyahWidgetData>(url, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
};

export default useVerseWidgetData;

import { useSelector } from 'react-redux';
import useSWR from 'swr';

import type { AyahWidgetData } from '@/components/AyahWidget/getAyahWidgetData';
import { DEFAULT_TRANSLATIONS } from '@/redux/defaultSettings/defaultSettings';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import { selectTheme } from '@/redux/slices/theme';
import type { VerseReference } from '@/utils/lessonContentParser';
import { fetcher } from 'src/api';

const useVerseWidgetData = (reference: VerseReference) => {
  const selectedTranslations = useSelector(selectSelectedTranslations);
  const theme = useSelector(selectTheme);

  // Fallback to Clear Quran if no user translations
  const translationIds =
    selectedTranslations?.length > 0 ? selectedTranslations : DEFAULT_TRANSLATIONS;

  // Build query string with all options (for proper cache key)
  const params = new URLSearchParams({
    chapter: String(reference.chapter),
    from: String(reference.from),
    translations: translationIds.join(','),
    theme: theme.type,
  });

  if (reference.to) params.set('to', String(reference.to));

  const url = `/api/ayah-widget?${params.toString()}`;

  return useSWR<AyahWidgetData>(url, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
};

export default useVerseWidgetData;

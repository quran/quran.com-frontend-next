import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import useAbortableEffect from '@/hooks/useAbortableEffect';
import Chapter from '@/types/Chapter';
import { getAllChaptersData } from '@/utils/chapter';

const DEFAULT_LOCALE = 'en';

/**
 * Fetch surah metadata for the Ayah widget builder and keep it in state.
 *
 * @param {string} locale locale used for the chapters API (defaults to "en").
 * @returns {Chapter[]} list of surahs sorted by id.
 */
const useAyahWidgetSurahs = (locale: string = DEFAULT_LOCALE): Chapter[] => {
  const { t } = useTranslation('ayah-widget');
  const [surahs, setSurahs] = useState<Chapter[]>([]);

  useAbortableEffect(
    (signal) => {
      const loadSurahs = async () => {
        try {
          const chaptersData = await getAllChaptersData(locale);
          if (signal.aborted) {
            return;
          }
          const mapped = Object.entries(chaptersData)
            .map(([chapterId, chapter]) => ({
              ...chapter,
              id: Number(chapterId),
            }))
            .filter((chapter) => Number.isFinite(Number(chapter.id)))
            .sort((a, b) => Number(a.id ?? 0) - Number(b.id ?? 0)) as Chapter[];
          setSurahs(mapped);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(t('errors.loadChapters'), error);
        }
      };

      loadSurahs();
    },
    [locale, t],
  );

  return surahs;
};

export default useAyahWidgetSurahs;

import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import { ROUTES } from '@/utils/navigation';

interface ChapterEvent {
  showEvent: boolean;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
}

const CHAPTER_ID_TO_SHOW = '67';

/**
 * A hook that returns the chapter event data if the current chapter has an event.
 *
 * @param {string} chapterId
 * @returns {ChapterEvent}
 */
const useChapterEvent = (chapterId: string): ChapterEvent => {
  const { t } = useTranslation('quran-reader');

  const eventData = useMemo(() => {
    if (chapterId === CHAPTER_ID_TO_SHOW) {
      return {
        showEvent: true,
        title: t('chapter-event.title'),
        description: t('chapter-event.description'),
        ctaText: t('chapter-event.cta'),
        ctaLink: ROUTES.RAMADAN_CHALLENGE,
      };
    }

    return {
      showEvent: false,
      title: '',
      description: '',
      ctaText: '',
      ctaLink: '',
    };
  }, [chapterId, t]);

  return eventData;
};

export default useChapterEvent;

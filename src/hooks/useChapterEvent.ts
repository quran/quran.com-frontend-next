import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import useRamadanChallengeStatus from './useGetRamadanChallengeStatus';

import Language from '@/types/Language';
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
  const { lang, t } = useTranslation('quran-reader');
  const { isEnrolled, isLoading } = useRamadanChallengeStatus();

  const eventData = useMemo(() => {
    if (!isLoading && chapterId === CHAPTER_ID_TO_SHOW && !isEnrolled && lang !== Language.AR) {
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
  }, [chapterId, isEnrolled, isLoading, lang, t]);

  return eventData;
};

export default useChapterEvent;

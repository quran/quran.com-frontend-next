import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import useRamadanChallengeStatus from './useGetRamadanChallengeStatus';
import useHasMounted from './useHasMounted';

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
  const { lang } = useTranslation('quran-reader');
  const { isEnrolled, isLoading } = useRamadanChallengeStatus();
  const hasMounted = useHasMounted();

  const eventData = useMemo(() => {
    if (
      hasMounted &&
      !isLoading &&
      chapterId === CHAPTER_ID_TO_SHOW &&
      !isEnrolled &&
      lang === Language.EN
    ) {
      return {
        showEvent: true,
        title: 'Take the Surah Mulk Challenge this Ramadan! 🚀',
        description: 'Dont miss this great opportunity (free)! Connect deeply with 1 verse a day.',
        ctaText: 'Learn More',
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
  }, [chapterId, isEnrolled, isLoading, hasMounted, lang]);

  return eventData;
};

export default useChapterEvent;

import Language from '@/types/Language';

export interface LearningPlanBannerConfig {
  slug: string;
  imagePath: string;
  /** Key suffix for translations: `learning-plan-banner-{translationKey}.*` */
  translationKey: string;
}

/**
 * Learning plan banner configurations by language and chapter.
 * Access: LEARNING_PLAN_BANNERS[language]?.[chapterId]
 */
export const LEARNING_PLAN_BANNERS: Partial<
  Record<Language, Record<number, LearningPlanBannerConfig>>
> = {
  [Language.EN]: {
    67: {
      slug: 'the-rescuer-powerful-lessons-in-surah-al-mulk',
      imagePath:
        'https://images.quran.com/the-rescuer-powerful-lessons-in-surah-al-mulk/Banner.png',
      translationKey: 'al-mulk',
    },
    18: {
      slug: '4-life-changing-stories-lessons-from-surah-al-kahf',
      imagePath:
        'https://images.quran.com/4-life-changing-stories-lessons-from-surah-al-kahf/Banner.webp',
      translationKey: 'al-kahf',
    },
  },
  [Language.UR]: {
    67: {
      slug: 'surah-al-mulk-7-day-journey-ur',
      imagePath: 'https://images.quran.com/surah-al-mulk-7-day-journey-ur-2/Banner.png',
      translationKey: 'al-mulk',
    },
    18: {
      slug: '4-life-changing-stories-lessons-from-surah-kahf-ur',
      imagePath:
        'https://images.quran.com/4-life-changing-stories-lessons-from-surah-al-kahf-ur/Banner.webp',
      translationKey: 'al-kahf',
    },
  },
  [Language.SW]: {
    67: {
      slug: 'mwokozi-mafunzo-kutoka-surah-al-mulk',
      imagePath: 'https://images.quran.com/surah-al-mulk-7-day-journey-sw/Banner.png',
      translationKey: 'al-mulk',
    },
  },
};

/**
 * Get the banner config for a given language and chapter.
 * @param {Language} language - The language to look up the banner config for.
 * @param {number} chapterId - The chapter ID to look up the banner config for.
 * @returns {LearningPlanBannerConfig | undefined} The banner config, or undefined if no banner exists.
 */
export const getLearningPlanBannerConfig = (
  language: Language,
  chapterId: number,
): LearningPlanBannerConfig | undefined => LEARNING_PLAN_BANNERS[language]?.[chapterId];

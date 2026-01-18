import React from 'react';

import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';

import styles from './LearningPlanBanner.module.scss';

import Button, { ButtonSize } from '@/dls/Button/Button';
import Link from '@/dls/Link/Link';
import Language from '@/types/Language';
import { logButtonClick } from '@/utils/eventLogger';
import { getCourseNavigationUrl } from '@/utils/navigation';

const BANNER_WIDTH = 1230;
const BANNER_HEIGHT = 307;

interface LearningPlanConfig {
  slug: string;
  imagePath: string;
}

const LEARNING_PLAN_CONFIGS: Partial<Record<Language, LearningPlanConfig>> = {
  [Language.EN]: {
    slug: 'the-rescuer-powerful-lessons-in-surah-al-mulk',
    imagePath: 'https://images.quran.com/the-rescuer-powerful-lessons-in-surah-al-mulk/Banner.png',
  },
  [Language.UR]: {
    slug: 'surah-al-mulk-7-day-journey-ur',
    imagePath: 'https://images.quran.com/surah-al-mulk-7-day-journey-ur-2/Banner.png',
  },
};

interface Props {
  language: Language;
}

const LearningPlanBanner: React.FC<Props> = ({ language }) => {
  const { t } = useTranslation('quran-reader');

  const config = LEARNING_PLAN_CONFIGS[language];

  if (!config) {
    return null;
  }

  const learningPlanUrl = getCourseNavigationUrl(config.slug);

  return (
    <aside
      className={styles.bannerWrapper}
      aria-label={t('learning-plan-banner.banner-wrapper-aria-label')}
      aria-live="polite"
      data-testid="learning-plan-banner"
    >
      <div className={styles.bannerContainer}>
        <div className={styles.captionRow}>
          <p className={styles.caption}>
            <strong className={styles.captionBold}>
              {t('learning-plan-banner.main-headline')}{' '}
            </strong>
            {t('learning-plan-banner.subtitle-description')}
          </p>
          <Button
            size={ButtonSize.Small}
            href={learningPlanUrl}
            className={styles.ctaButton}
            ariaLabel={t('learning-plan-banner.button-accessibility-label')}
            onClick={() => logButtonClick('learning_plan_banner_cta')}
          >
            {t('learning-plan-banner.call-to-action-button')}
          </Button>
        </div>

        <Link
          href={learningPlanUrl}
          ariaLabel={t('learning-plan-banner.banner-image-description')}
          onClick={() => logButtonClick('learning_plan_banner_image')}
          className={styles.imageLink}
        >
          <div className={styles.imageWrap}>
            <Image
              src={config.imagePath}
              alt={t('learning-plan-banner.banner-image-alt-text')}
              width={BANNER_WIDTH}
              height={BANNER_HEIGHT}
              priority
            />
          </div>
        </Link>
      </div>
    </aside>
  );
};

export default LearningPlanBanner;

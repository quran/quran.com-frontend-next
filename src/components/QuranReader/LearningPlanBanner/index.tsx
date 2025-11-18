import React from 'react';

import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';

import styles from './LearningPlanBanner.module.scss';

import Button, { ButtonSize } from '@/dls/Button/Button';
import Link from '@/dls/Link/Link';
import { logButtonClick } from '@/utils/eventLogger';
import { getLearningPlanBannerUrl } from '@/utils/quranReflect/navigation';

const LEARNING_PLAN_SLUG = 'the-rescuer-powerful-lessons-in-surah-al-mulk';
const LEARNING_PLAN_URL = getLearningPlanBannerUrl(LEARNING_PLAN_SLUG);
const BANNER_IMAGE_PATH =
  'https://images.quran.com/the-rescuer-powerful-lessons-in-surah-al-mulk/Banner.png';
const BANNER_WIDTH = 1230;
const BANNER_HEIGHT = 307;

const LearningPlanBanner: React.FC = () => {
  const { t } = useTranslation('quran-reader');

  return (
    <aside
      data-testid="learning-plan-banner"
      className={styles.bannerWrapper}
      aria-label={t('learning-plan-banner.banner-wrapper-aria-label')}
      aria-live="polite"
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
            href={LEARNING_PLAN_URL}
            className={styles.ctaButton}
            ariaLabel={t('learning-plan-banner.button-accessibility-label')}
            onClick={() => logButtonClick('learning_plan_banner_cta')}
          >
            {t('learning-plan-banner.call-to-action-button')}
          </Button>
        </div>

        <Link
          href={LEARNING_PLAN_URL}
          ariaLabel={t('learning-plan-banner.banner-image-description')}
          onClick={() => logButtonClick('learning_plan_banner_image')}
          className={styles.imageLink}
        >
          <div className={styles.imageWrap}>
            <Image
              src={BANNER_IMAGE_PATH}
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

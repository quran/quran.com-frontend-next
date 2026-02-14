import React from 'react';

import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';

import styles from './LearningPlanBanner.module.scss';
import { getLearningPlanBannerConfig } from './learningPlanBannerConfigs';

import Button, { ButtonSize } from '@/dls/Button/Button';
import Link from '@/dls/Link/Link';
import Language from '@/types/Language';
import { logButtonClick } from '@/utils/eventLogger';
import { getCourseNavigationUrl } from '@/utils/navigation';

const BANNER_WIDTH = 1230;
const BANNER_HEIGHT = 307;

interface Props {
  language: Language;
  chapterId: number;
}

const LearningPlanBanner: React.FC<Props> = ({ language, chapterId }) => {
  const { t } = useTranslation('quran-reader');

  const config = getLearningPlanBannerConfig(language, chapterId);

  if (!config) {
    return null;
  }

  const learningPlanUrl = getCourseNavigationUrl(config.slug);
  const translationKey = `learning-plan-banner-${config.translationKey}`;

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
            <strong className={styles.captionBold}>{t(`${translationKey}.main-headline`)} </strong>
            {t(`${translationKey}.subtitle-description`)}
          </p>
          <Button
            size={ButtonSize.Small}
            href={learningPlanUrl}
            className={styles.ctaButton}
            ariaLabel={t(`${translationKey}.button-accessibility-label`)}
            onClick={() => logButtonClick('learning_plan_banner_cta')}
          >
            {t('learning-plan-banner.call-to-action-button')}
          </Button>
        </div>

        <Link
          href={learningPlanUrl}
          ariaLabel={t(`${translationKey}.banner-image-description`)}
          onClick={() => logButtonClick('learning_plan_banner_image')}
          className={styles.imageLink}
        >
          <div className={styles.imageWrap}>
            <Image
              src={config.imagePath}
              alt={t(`${translationKey}.banner-image-alt-text`)}
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

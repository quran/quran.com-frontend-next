import React, { useEffect, useRef, useState } from 'react';

import classNames from 'classnames';
import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';

import styles from './MulkLearningPlanBanner.module.scss';

import Button, { ButtonSize } from '@/dls/Button/Button';
import Link from '@/dls/Link/Link';

const LEARNING_PLAN_URL = '/learning-plans/the-rescuer-powerful-lessons-in-surah-al-mulk';
const BANNER_IMAGE_PATH =
  'https://images.quran.com/the-rescuer-powerful-lessons-in-surah-al-mulk/Banner.png';
const BANNER_WIDTH = 1230;
const BANNER_HEIGHT = 307;

const MulkLearningPlanBanner: React.FC = () => {
  const { t } = useTranslation('common');
  const [isVisible, setIsVisible] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel) return () => {};

    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    const handleIntersect: IntersectionObserverCallback = (entries) => {
      if (entries[0]?.isIntersecting) {
        setIsVisible(true);
        observerRef.current?.disconnect();
        observerRef.current = null;
      }
    };

    const obs = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: '0px 0px -40% 0px',
      threshold: 0,
    });

    obs.observe(sentinel);
    observerRef.current = obs;

    return () => {
      obs.disconnect();
      observerRef.current = null;
    };
  }, []);

  const shouldShowBanner = isVisible;

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" className={styles.sentinel} />

      <aside
        className={classNames(styles.bannerWrapper, {
          [styles.visible]: shouldShowBanner,
        })}
        role="region"
        aria-label="Learning plan promotion"
        aria-live="polite"
      >
        <div className={styles.bannerContainer}>
          <p className={styles.mobileCaption} id="mulk-banner-caption">
            <strong className={styles.captionBold}>{t('mulk-lp.caption-bold')} </strong>
            {t('mulk-lp.caption-suffix')}
          </p>

          <Link
            href={LEARNING_PLAN_URL}
            className={styles.imageLink}
            ariaLabel={t('mulk-lp.aria-image-link')}
          >
            <div className={styles.imageWrap}>
              <Image
                src={BANNER_IMAGE_PATH}
                alt={t('mulk-lp.image-alt')}
                width={BANNER_WIDTH}
                height={BANNER_HEIGHT}
                sizes="(max-width: 768px) 100vw, 1230px"
              />
            </div>
          </Link>

          <Button
            size={ButtonSize.Medium}
            href={LEARNING_PLAN_URL}
            className={styles.mobileButton}
            ariaLabel={t('mulk-lp.aria-cta')}
          >
            {t('mulk-lp.cta-text')}
          </Button>

          <div className={styles.desktopCaptionRow} aria-labelledby="mulk-banner-caption">
            <p className={styles.desktopCaption}>
              <strong className={styles.captionBold}>{t('mulk-lp.caption-bold')} </strong>
              {t('mulk-lp.caption-suffix')}
            </p>
            <Button
              size={ButtonSize.Medium}
              href={LEARNING_PLAN_URL}
              className={styles.desktopButton}
              ariaLabel={t('mulk-lp.aria-cta')}
            >
              {t('mulk-lp.cta-text')}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default MulkLearningPlanBanner;

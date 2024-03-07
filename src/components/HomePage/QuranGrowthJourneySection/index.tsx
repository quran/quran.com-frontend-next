import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import CollapsibleSection, { CollapsibleType } from './CollapsibleSection';
import styles from './QuranGrowthJourneySection.module.scss';
import SubheaderSection from './SubheaderSection';

import Link, { LinkVariant } from '@/dls/Link/Link';
import MoonIllustrationSVG from '@/public/images/moon-illustration.svg';
import { logButtonClick, logEvent } from '@/utils/eventLogger';

const PRODUCT_UPDATES_LINK = '/product-updates/quran-reading-streaks';

const QuranGrowthJourneySection = () => {
  const { t } = useTranslation('home');

  const onLearnMoreClicked = () => {
    logButtonClick('homepage_qgj_learn_more');
  };

  const logOpenChange = (collapsibleType: CollapsibleType, isOpen: boolean) => {
    if (isOpen) {
      logEvent(`homepage_${collapsibleType}_collapse_opened`);
    } else {
      logEvent(`homepage_${collapsibleType}_collapse_closed`);
    }
  };

  return (
    <div className={styles.wrapper} id="qgj-widget">
      <div className={styles.illustrationContainer}>
        <MoonIllustrationSVG />
      </div>
      <div className={styles.header}>
        <p className={styles.title}>{t('qgj.title')}</p>
        <Link
          onClick={onLearnMoreClicked}
          variant={LinkVariant.Highlight}
          href={PRODUCT_UPDATES_LINK}
        >
          {t('common:learn-more')}
        </Link>
      </div>
      <SubheaderSection />
      <CollapsibleSection
        onOpenChange={logOpenChange}
        type={CollapsibleType.QuranReadingGoalsType}
      />
      <CollapsibleSection onOpenChange={logOpenChange} type={CollapsibleType.LearningPlansType} />
    </div>
  );
};

export default QuranGrowthJourneySection;

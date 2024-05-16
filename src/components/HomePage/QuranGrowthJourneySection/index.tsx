import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import CollapsibleSection, { CollapsibleType } from './CollapsibleSection';
import styles from './QuranGrowthJourneySection.module.scss';

import MoonIllustrationSVG from '@/public/images/moon-illustration.svg';
import { logEvent } from '@/utils/eventLogger';

const QuranGrowthJourneySection = () => {
  const { t } = useTranslation('home');

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
      </div>
      <CollapsibleSection
        onOpenChange={logOpenChange}
        type={CollapsibleType.QuranReadingGoalsType}
      />
      <CollapsibleSection onOpenChange={logOpenChange} type={CollapsibleType.LearningPlansType} />
    </div>
  );
};

export default QuranGrowthJourneySection;

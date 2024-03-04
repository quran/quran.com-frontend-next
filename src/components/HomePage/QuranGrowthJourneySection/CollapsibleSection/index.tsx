import React, { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './CollapsibleSection.module.scss';
import CollapsibleTitle from './CollapsibleTitle';
import LearningPlans from './LearningPlans';

import LearningPlansButtons from '@/components/HomePage/QuranGrowthJourneySection/CallToActionButtons/LearningPlansButtons';
import QuranGoalsButtons from '@/components/HomePage/QuranGrowthJourneySection/CallToActionButtons/QuranGoalsButtons';
import QuranReadingGoals from '@/components/HomePage/QuranGrowthJourneySection/CollapsibleSection/QuranReadingGoals';
import Collapsible, { CollapsibleDirection } from '@/dls/Collapsible/Collapsible';
import ChevronDownIcon from '@/icons/chevron-down.svg';
import GoalIcon from '@/icons/goal-1.svg';
import ReaderIcon from '@/icons/learning-plan.svg';

export enum CollapsibleType {
  QuranReadingGoalsType = 'quran_reading_goals',
  LearningPlansType = 'learning_plans',
}

type Props = {
  type: CollapsibleType;
  onOpenChange: (collapsibleType: CollapsibleType, isOpen: boolean) => void;
};

const CollapsibleSection: React.FC<Props> = ({ onOpenChange, type }) => {
  const { t } = useTranslation('home');
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={styles.container}>
      <Collapsible
        direction={CollapsibleDirection.Right}
        onOpenChange={(newIsOpen: boolean) => {
          setIsOpen(newIsOpen);
          onOpenChange(type, isOpen);
        }}
        shouldOpen={isOpen}
        title={
          type === CollapsibleType.QuranReadingGoalsType ? (
            <div>
              <CollapsibleTitle title={t('qgj.quran-reading-goals.title')} icon={<GoalIcon />} />
              <QuranGoalsButtons />
            </div>
          ) : (
            <div>
              <CollapsibleTitle title={t('qgj.learning-plans.title')} icon={<ReaderIcon />} />
              <LearningPlansButtons />
            </div>
          )
        }
        prefix={
          <div className={styles.prefixSVG}>
            <ChevronDownIcon />
          </div>
        }
        shouldRotatePrefixOnToggle
      >
        {({ isOpen: isCollapsibleOpen }) => {
          if (!isCollapsibleOpen) return null;
          return (
            <div className={styles.body}>
              {type === CollapsibleType.QuranReadingGoalsType ? (
                <QuranReadingGoals />
              ) : (
                <LearningPlans />
              )}
            </div>
          );
        }}
      </Collapsible>
    </div>
  );
};

export default CollapsibleSection;

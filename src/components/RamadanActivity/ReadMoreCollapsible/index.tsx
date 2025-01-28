import React from 'react';

import styles from './ReadMoreCollapsible.module.scss';

import Collapsible, { CollapsibleDirection } from '@/components/dls/Collapsible/Collapsible';
import ChevronDownIcon from '@/icons/chevron-down.svg';
import { logEvent } from '@/utils/eventLogger';

export enum Section {
  MINDFUL_FASTING = 'mindful_fasting',
  AYAH_LOOKUP_CHALLENGE = 'ayah_challenge',
  MAS_QUIZ = 'mas_quiz',
  LEARNING_PLANS = 'learning_plans',
  MONTH_STREAK = 'month_streak',
  INVITE_PEOPLE = 'invite_people',
  CRISIS = 'crises',
  INSPIRING_READING = 'inspiring_reading',
  MORE_REVIEWS = 'more_reviews',
}

export enum TitleType {
  SHOW_MORE = 'show_more',
  LEARN_MORE = 'learn_more',
  MORE_REVIEWS = 'more_reviews',
}

type Props = {
  children: React.ReactNode;
  section: Section;
  titleType?: TitleType;
};

const ReadMoreCollapsible: React.FC<Props> = ({
  children,
  section,
  titleType = TitleType.LEARN_MORE,
}) => {
  const onCollapseOpenChange = (isCollapseOpen: boolean) => {
    if (isCollapseOpen) {
      logEvent('ramadan_activities_collapse_opened', { section });
    } else {
      logEvent('ramadan_activities_collapse_closed', { section });
    }
  };
  return (
    <div className={styles.container}>
      <Collapsible
        direction={CollapsibleDirection.Right}
        onOpenChange={(isCollapseOpen) => onCollapseOpenChange(isCollapseOpen)}
        title={
          <span className={styles.title}>
            {titleType === TitleType.MORE_REVIEWS ? 'More Reviews' : 'Learn More'}
          </span>
        }
        prefix={<ChevronDownIcon />}
        shouldRotatePrefixOnToggle
        headerClassName={styles.collapsibleHeader}
      >
        {({ isOpen: isOpenRenderProp }) => {
          if (!isOpenRenderProp) return null;

          return <div className={styles.body}>{children}</div>;
        }}
      </Collapsible>
    </div>
  );
};

export default ReadMoreCollapsible;

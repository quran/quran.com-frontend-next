import React from 'react';

import useTranslation from 'next-translate/useTranslation';

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
}

export enum TitleType {
  SHOW_MORE = 'show_more',
  LEARN_MORE = 'learn_more',
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
  const { t } = useTranslation('common');

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
            {t(titleType === TitleType.LEARN_MORE ? 'learn-more' : 'show-more')}
          </span>
        }
        prefix={<ChevronDownIcon />}
        shouldRotatePrefixOnToggle
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

import React from 'react';

import classNames from 'classnames';

import CommunitySection from '../CommunitySection';
import ExploreTopicsSection from '../ExploreTopicsSection';
import LearningPlansSection from '../LearningPlansSection';
import QuranGrowthJourneySection from '../QuranGrowthJourneySection';
import QuranInYearSection from '../QuranInYearSection';

import styles from '@/pages/index.module.scss';
import { Course } from '@/types/auth/Course';
import { VersesResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';

type Props = {
  isUserLoggedIn: boolean;
  todayAyah: { chapter: number; verse: number } | null;

  learningPlans: Course[];

  chaptersData?: ChaptersData;
  quranInYearVerses?: VersesResponse; // SSR verse data so section renders without JS
};

const MobileHomepageSections: React.FC<Props> = ({
  isUserLoggedIn,
  todayAyah,
  chaptersData,
  learningPlans,
  quranInYearVerses,
}) => {
  return isUserLoggedIn ? (
    <>
      {todayAyah && (
        <div className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}>
          <QuranInYearSection chaptersData={chaptersData} initialVersesData={quranInYearVerses} />
        </div>
      )}
      <div className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}>
        <LearningPlansSection courses={learningPlans} />
      </div>
      <div className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}>
        <CommunitySection />
      </div>
      <div className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}>
        <ExploreTopicsSection />
      </div>
    </>
  ) : (
    <>
      <div className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}>
        <QuranGrowthJourneySection />
      </div>
      <div className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}>
        <ExploreTopicsSection />
      </div>
      {todayAyah && (
        <div className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}>
          <QuranInYearSection chaptersData={chaptersData} initialVersesData={quranInYearVerses} />
        </div>
      )}
      <div className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}>
        <LearningPlansSection courses={learningPlans} />
      </div>
      <div className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}>
        <CommunitySection />
      </div>
    </>
  );
};

export default MobileHomepageSections;

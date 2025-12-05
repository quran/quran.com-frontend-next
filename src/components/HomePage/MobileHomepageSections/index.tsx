import React from 'react';

import classNames from 'classnames';

import CommunitySection from '../CommunitySection';
import ExploreTopicsSection from '../ExploreTopicsSection';
import LearningPlansSection from '../LearningPlansSection';
import QuranGrowthJourneySection from '../QuranGrowthJourneySection';
import QuranInYearSection from '../QuranInYearSection';

import ChapterAndJuzListWrapper from '@/components/chapters/ChapterAndJuzList';
import styles from '@/pages/index.module.scss';
import Chapter from 'types/Chapter';
import ChaptersData from 'types/ChaptersData';

type Props = {
  isUserLoggedIn: boolean;
  todayAyah: { chapter: number; verse: number } | null;
  chaptersData?: ChaptersData;
  chapters?: Chapter[];
};

const MobileHomepageSections: React.FC<Props> = ({
  isUserLoggedIn,
  todayAyah,
  chaptersData,
  chapters = [],
}) => {
  return isUserLoggedIn ? (
    <>
      {todayAyah && (
        <div className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}>
          <QuranInYearSection chaptersData={chaptersData} />
        </div>
      )}
      <div className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}>
        <LearningPlansSection />
      </div>
      <div className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}>
        <CommunitySection />
      </div>
      <div className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}>
        <ExploreTopicsSection />
      </div>
      <div className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}>
        <QuranGrowthJourneySection />
      </div>
      <div className={styles.flowItem}>
        <ChapterAndJuzListWrapper chapters={chapters} />
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
          <QuranInYearSection chaptersData={chaptersData} />
        </div>
      )}
      <div className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}>
        <LearningPlansSection />
      </div>
      <div className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}>
        <CommunitySection />
      </div>
      <div className={styles.flowItem}>
        <ChapterAndJuzListWrapper chapters={chapters} />
      </div>
    </>
  );
};

export default MobileHomepageSections;

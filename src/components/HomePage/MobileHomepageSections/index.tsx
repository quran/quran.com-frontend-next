import React from 'react';

import classNames from 'classnames';

import CommunitySection from '../CommunitySection';
import ExploreTopicsSection from '../ExploreTopicsSection';
import LearningPlansSection from '../LearningPlansSection';
import QuranInYearSection from '../QuranInYearSection';

import styles from '@/pages/index.module.scss';

type Props = {
  isUserLoggedIn: boolean;
  todayAyah: { chapter: number; verse: number } | null;
};

const MobileHomepageSections: React.FC<Props> = ({ isUserLoggedIn, todayAyah }) => {
  return isUserLoggedIn ? (
    <>
      {todayAyah && (
        <div className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}>
          <QuranInYearSection />
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
    </>
  ) : (
    <>
      <div className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}>
        <ExploreTopicsSection />
      </div>
      {todayAyah && (
        <div className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}>
          <QuranInYearSection />
        </div>
      )}
      <div className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}>
        <LearningPlansSection />
      </div>
      <div className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}>
        <CommunitySection />
      </div>
    </>
  );
};

export default MobileHomepageSections;

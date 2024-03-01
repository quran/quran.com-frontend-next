import React from 'react';

import Trans from 'next-translate/Trans';

import styles from './RamadanActivitiesSection.module.scss';

import Link, { LinkVariant } from '@/dls/Link/Link';
import MoonIllustrationSVG from '@/public/images/moon-illustration.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { getRamadanActivitiesNavigationUrl } from '@/utils/navigation';

const RamadanActivitiesSection = () => {
  const onLinkClicked = () => {
    logButtonClick('homepage_ramadan_activities_cta');
  };

  return (
    <div className={styles.container}>
      <div className={styles.illustrationContainer}>
        <MoonIllustrationSVG />
      </div>
      <p className={styles.cta}>
        <Trans
          components={{
            link: (
              <Link
                onClick={onLinkClicked}
                href={getRamadanActivitiesNavigationUrl()}
                variant={LinkVariant.Blend}
                isNewTab
              />
            ),
          }}
          i18nKey="home:ramadan-activities-cta"
          values={{ source: 'quranwbw' }}
        />
      </p>
    </div>
  );
};

export default RamadanActivitiesSection;

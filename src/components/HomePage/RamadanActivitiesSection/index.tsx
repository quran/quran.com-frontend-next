import React from 'react';

import Trans from 'next-translate/Trans';

import styles from './RamadanActivitiesSection.module.scss';

import Link, { LinkVariant } from '@/dls/Link/Link';
import { logButtonClick } from '@/utils/eventLogger';
import { getQuranicCalendarNavigationUrl } from '@/utils/navigation';

const RamadanActivitiesSection = () => {
  const onLinkClicked = () => {
    logButtonClick('homepage_quranic_calendar_cta');
  };

  return (
    <div className={styles.container}>
      <p className={styles.cta}>
        <Trans
          components={{
            link: (
              <Link
                key={0}
                onClick={onLinkClicked}
                href={getQuranicCalendarNavigationUrl()}
                variant={LinkVariant.Blend}
                isNewTab
              />
            ),
            b: <b className={styles.bold} key={1} />,
          }}
          i18nKey="home:ramadan-activities-cta"
          values={{ source: 'quranwbw' }}
        />
      </p>
    </div>
  );
};

export default RamadanActivitiesSection;

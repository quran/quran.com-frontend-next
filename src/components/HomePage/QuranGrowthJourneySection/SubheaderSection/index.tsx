import React from 'react';

import Trans from 'next-translate/Trans';

import styles from './SubheaderSection.module.scss';

import Link, { LinkVariant } from '@/dls/Link/Link';
import useGetStreakWithMetadata from '@/hooks/auth/useGetStreakWithMetadata';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { getLoginNavigationUrl } from '@/utils/navigation';

const SubheaderSection = () => {
  const onLoginLinkClicked = () => {
    logButtonClick('homepage_qgj_login');
  };

  const { isLoading, error, goal } = useGetStreakWithMetadata({
    disableIfNoGoalExists: false,
  });

  if (isLoggedIn()) {
    if (error || (!isLoading && !goal)) {
      return (
        <div className={styles.container}>
          <Trans
            i18nKey="home:qgj.desc.logged-in-no-goal"
            components={{
              bold: <span key={0} className={styles.bold} />,
            }}
          />
        </div>
      );
    }
    return <div className={styles.container} />;
  }

  return (
    <div className={styles.container}>
      <Trans
        i18nKey="home:qgj.desc.logged-out"
        components={{
          bold: <span key={0} className={styles.bold} />,
          link: (
            <Link
              onClick={onLoginLinkClicked}
              key={1}
              href={getLoginNavigationUrl()}
              variant={LinkVariant.Blend}
            />
          ),
        }}
      />
    </div>
  );
};

export default SubheaderSection;

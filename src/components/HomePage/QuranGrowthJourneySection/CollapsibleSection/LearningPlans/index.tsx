import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import useSWRImmutable from 'swr/immutable';

import styles from './LearningPlans.module.scss';

import Button, { ButtonSize } from '@/dls/Button/Button';
import { getUserCoursesCount } from '@/utils/auth/api';
import { makeGetUserCoursesCountUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { getCoursesNavigationUrl, getMyCoursesNavigationUrl } from '@/utils/navigation';

const LearningPlans = () => {
  const { t } = useTranslation('home');

  const onViewPlansButtonClicked = () => {
    logButtonClick('homepage_qgj_view_plans');
  };

  const onMyPlansButtonClicked = () => {
    logButtonClick('homepage_qgj_my_plans');
  };

  const { data, isValidating, error } = useSWRImmutable(
    isLoggedIn() ? makeGetUserCoursesCountUrl() : null,
    async () => {
      const response = await getUserCoursesCount();
      return response;
    },
  );

  const viewPlansButton = (
    <Button
      onClick={onViewPlansButtonClicked}
      href={getCoursesNavigationUrl()}
      className={styles.viewPlansBtn}
      size={ButtonSize.Small}
    >
      {t('qgj.learning-plans.cta.view-plans')}
    </Button>
  );

  if (!isLoggedIn()) {
    return (
      <div>
        <p className={styles.desc}>{t('qgj.learning-plans.desc.logged-out')}</p>
        {viewPlansButton}
      </div>
    );
  }

  /**
   * If we are loading, or if we have an error, or if we have no data, we show the message
   */
  if ((isValidating && !data) || error || (data?.count ?? 0) === 0) {
    return (
      <div>
        <p className={styles.desc}>{t('qgj.learning-plans.desc.logged-in-no-plans')}</p>
        {viewPlansButton}
      </div>
    );
  }
  // user has at least 1 plan
  return (
    <div>
      <p className={styles.desc}>{t('qgj.learning-plans.desc.logged-in')}</p>
      <div className={styles.buttonsContainer}>
        {viewPlansButton}
        <Button
          onClick={onMyPlansButtonClicked}
          href={getMyCoursesNavigationUrl()}
          size={ButtonSize.Small}
        >
          {t('qgj.learning-plans.cta.my-plans')}
        </Button>
      </div>
    </div>
  );
};

export default LearningPlans;

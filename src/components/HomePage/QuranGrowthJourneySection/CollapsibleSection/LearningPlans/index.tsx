import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import useSWRImmutable from 'swr/immutable';

import styles from './LearningPlans.module.scss';

import { getUserCoursesCount } from '@/utils/auth/api';
import { makeGetUserCoursesCountUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';

const LearningPlans = () => {
  const { t } = useTranslation('home');

  const { data, isValidating, error } = useSWRImmutable(
    isLoggedIn() ? makeGetUserCoursesCountUrl() : null,
    async () => {
      const response = await getUserCoursesCount();
      return response;
    },
  );

  if (!isLoggedIn()) {
    return <p className={styles.desc}>{t('qgj.learning-plans.desc.logged-out')}</p>;
  }

  /**
   * If we are loading, or if we have an error, or if we have no data, we show the message
   */
  if ((isValidating && !data) || error || (data?.count ?? 0) === 0) {
    return <p className={styles.desc}>{t('qgj.learning-plans.desc.logged-in-no-plans')}</p>;
  }
  // user has at least 1 plan
  return <p className={styles.desc}>{t('qgj.learning-plans.desc.logged-in')}</p>;
};

export default LearningPlans;

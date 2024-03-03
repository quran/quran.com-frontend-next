import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import useSWRImmutable from 'swr/immutable';

import styles from './CallToActionButtons.module.scss';

import Button, { ButtonSize, ButtonType } from '@/dls/Button/Button';
import { getUserCoursesCount } from '@/utils/auth/api';
import { makeGetUserCoursesCountUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { getCoursesNavigationUrl, getMyCoursesNavigationUrl } from '@/utils/navigation';

const LearningPlansButtons = () => {
  const { t } = useTranslation('home');
  const { data, isValidating, error } = useSWRImmutable(
    isLoggedIn() ? makeGetUserCoursesCountUrl() : null,
    async () => {
      const response = await getUserCoursesCount();
      return response;
    },
  );

  const onViewPlansButtonClicked = (e) => {
    // don't toggle collapsible parent when clicking
    e.stopPropagation();
    logButtonClick('homepage_qgj_view_plans');
  };

  const onMyPlansButtonClicked = (e) => {
    e.stopPropagation();
    logButtonClick('homepage_qgj_my_plans');
  };

  const viewPlansButton = (
    <Button
      onClick={onViewPlansButtonClicked}
      href={getCoursesNavigationUrl()}
      className={styles.viewPlansBtn}
      size={ButtonSize.Small}
      type={ButtonType.Success}
    >
      {t('qgj.learning-plans.cta.all-plans')}
    </Button>
  );

  if (!isLoggedIn()) {
    return <div className={styles.buttonsContainer}>{viewPlansButton}</div>;
  }

  /**
   * If we are loading, or if we have an error, or if we have no data, we show the message
   */
  if ((isValidating && !data) || error || (data?.count ?? 0) === 0) {
    return <div className={styles.buttonsContainer}>{viewPlansButton}</div>;
  }

  // user has already 1 plan
  return (
    <div className={styles.buttonsContainer}>
      {viewPlansButton}
      <Button
        onClick={onMyPlansButtonClicked}
        href={getMyCoursesNavigationUrl()}
        size={ButtonSize.Small}
        type={ButtonType.Success}
      >
        {t('qgj.learning-plans.cta.my-plans')}
      </Button>
    </div>
  );
};

export default LearningPlansButtons;

import React, { useState } from 'react';

import umalqura from '@umalqura/core';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import ActionButtons from './ActionButtons';
import styles from './QuranicCalendarHero.module.scss';

import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useGetUserQuranProgramEnrollment from '@/hooks/auth/useGetUserQuranProgramEnrollment';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import Background from '@/icons/background.svg';
import { enrollUserInQuranProgram } from '@/utils/auth/api';
import { QURANIC_CALENDAR_PROGRAM_ID } from '@/utils/auth/constants';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import {
  getLoginNavigationUrl,
  getProfileNavigationUrl,
  getQuranicCalendarNavigationUrl,
} from '@/utils/navigation';

type Props = {
  currentQuranicCalendarWeek: number;
  currentHijriDate: umalqura.UmAlQura;
};

const QuranicCalendarHero: React.FC<Props> = ({ currentQuranicCalendarWeek, currentHijriDate }) => {
  const { t, lang } = useTranslation('quranic-calendar');
  const toast = useToast();
  const {
    isSubscribed,
    isLoading: isSubscriptionLoading,
    mutate,
  } = useGetUserQuranProgramEnrollment({
    programId: QURANIC_CALENDAR_PROGRAM_ID,
  });
  const { isLoggedIn } = useIsLoggedIn();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const router = useRouter();

  const onEnrollButtonClicked = async () => {
    logButtonClick('quranic_calendar_enroll_in_program');
    if (isLoggedIn) {
      if (isSubscribed) {
        router.replace(getProfileNavigationUrl());
      } else if (!isSubscriptionLoading && !isSubscribed && !isEnrolling) {
        setIsEnrolling(true);
        try {
          const response = await enrollUserInQuranProgram(QURANIC_CALENDAR_PROGRAM_ID);
          if (response.success) {
            await mutate(); // Revalidate the subscription data
            toast(t('join-quranic-calendar-success'), { status: ToastStatus.Success });
          } else {
            toast(t('common:error.general'), { status: ToastStatus.Error });
          }
        } catch (error) {
          toast(t('common:error.general'), { status: ToastStatus.Error });
        } finally {
          setIsEnrolling(false);
        }
      }
    } else {
      router.replace(getLoginNavigationUrl(getQuranicCalendarNavigationUrl()));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.backgroundImage}>
        <Background />
      </div>
      <div className={styles.content}>
        <div className={styles.textContent}>
          <h1 className={styles.title}>{t('quranic-calendar')}</h1>
          <p className={styles.description}>{t('hero.description')}</p>
          <ActionButtons
            isSubscribed={isSubscribed}
            isSubscriptionLoading={isSubscriptionLoading}
            isEnrolling={isEnrolling}
            onEnrollButtonClicked={onEnrollButtonClicked}
            isLoggedIn={isLoggedIn}
          />
        </div>
        <div className={styles.weekDisplay}>
          <div className={styles.dateInfo}>
            <div className={styles.hijriDate}>
              {t(`islamic-months.${currentHijriDate.hm}`)} {currentHijriDate.hd}{' '}
              {currentHijriDate.hy}
            </div>
          </div>
          <div className={styles.weekContainer}>
            <div className={styles.weekLabel}>{t('week')}</div>
            <div className={styles.weekNumber}>
              {toLocalizedNumber(currentQuranicCalendarWeek, lang)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuranicCalendarHero;

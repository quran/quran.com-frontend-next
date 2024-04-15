import React, { useEffect, useState } from 'react';

import umalqura from '@umalqura/core';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './JoinQuranicCalendarButton.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonType } from '@/dls/Button/Button';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import NotificationBellIcon from '@/icons/notification-bell.svg';
import { isLoggedIn } from '@/utils/auth/login';
import { followUser, isUserFollowed } from '@/utils/auth/qf/api';
import { logButtonClick } from '@/utils/eventLogger';
import { getCurrentQuranicCalendarWeek } from '@/utils/hijri-date';
import { toLocalizedDate } from '@/utils/locale';
import { getLoginNavigationUrl, getQuranicCalendarNavigationUrl } from '@/utils/navigation';

const QC_USERNAME = 'calendar';

type Props = {
  currentHijriDate: umalqura.UmAlQura;
};

const JoinQuranicCalendarButton: React.FC<Props> = ({ currentHijriDate }) => {
  const { t, lang } = useTranslation('quranic-calendar');
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) {
      setIsLoading(true);
      isUserFollowed(QC_USERNAME)
        .then((response) => {
          setHasJoined(response.followed);
        })
        .catch(() => {
          setHasError(true);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, []);

  const router = useRouter();
  const onClick = () => {
    logButtonClick('join_quranic_calendar');
    if (isLoggedIn()) {
      setIsLoading(true);
      followUser(QC_USERNAME)
        .then(() => {
          toast(t('join-quranic-calendar-success'), {
            status: ToastStatus.Success,
          });
          setHasJoined(true);
        })
        .catch(() => {
          toast(t('common:error.general'), {
            status: ToastStatus.Error,
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      router.replace(getLoginNavigationUrl(getQuranicCalendarNavigationUrl()));
    }
  };

  const currentQuranicCalendarWeek = getCurrentQuranicCalendarWeek(currentHijriDate);

  return (
    <div>
      <div className={styles.text}>
        <div>
          {t('today', {
            day: currentHijriDate.hd,
            month: t(`islamic-months.${currentHijriDate.hm}`),
            year: currentHijriDate.hy,
            gregorianDate: toLocalizedDate(currentHijriDate.date, lang, {
              dateStyle: 'long',
            }),
          })}
        </div>
        {t('join-qc', {
          weekNumber: currentQuranicCalendarWeek,
        })}
      </div>
      <div className={classNames(styles.cta, styles.text)}>
        {hasJoined ? '' : t('join-quranic-calendar')}
      </div>
      <Button
        isLoading={isLoading}
        isDisabled={hasJoined || hasError}
        onClick={onClick}
        type={ButtonType.Success}
        shape={ButtonShape.Pill}
        size={ButtonSize.Small}
        prefix={<NotificationBellIcon />}
      >
        {hasJoined ? t('common:subscribed') : t('common:subscribe')}
      </Button>
    </div>
  );
};

export default JoinQuranicCalendarButton;

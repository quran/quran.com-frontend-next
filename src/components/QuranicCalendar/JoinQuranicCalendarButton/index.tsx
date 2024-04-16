import React, { useEffect, useState } from 'react';

import umalqura from '@umalqura/core';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './JoinQuranicCalendarButton.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonType } from '@/dls/Button/Button';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import NotificationBellIcon from '@/icons/notification-bell.svg';
import { isLoggedIn } from '@/utils/auth/login';
import { followUser, isUserFollowed } from '@/utils/auth/qf/api';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedDate, toLocalizedNumber } from '@/utils/locale';
import { getLoginNavigationUrl, getQuranicCalendarNavigationUrl } from '@/utils/navigation';

const QC_USERNAME = 'calendar';

type Props = {
  currentHijriDate: umalqura.UmAlQura;
  currentQuranicCalendarWeek: number;
};

const JoinQuranicCalendarButton: React.FC<Props> = ({
  currentQuranicCalendarWeek,
  currentHijriDate,
}) => {
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

  return (
    <div className={styles.text}>
      <div className={styles.bordered}>
        <Trans
          i18nKey="quranic-calendar:today"
          components={{
            br: <br key={0} />,
            highlight: <span key={1} className={styles.highlight} />,
          }}
          values={{
            day: toLocalizedNumber(currentHijriDate.hd, lang),
            month: t(`islamic-months.${currentHijriDate.hm}`),
            year: toLocalizedNumber(currentHijriDate.hy, lang, false, {
              useGrouping: false,
            }),
            gregorianDate: toLocalizedDate(currentHijriDate.date, lang, {
              dateStyle: 'long',
            }),
          }}
        />
        <br />
        <Trans
          i18nKey="quranic-calendar:join-qc.line-1"
          components={{
            br: <br key={0} />,
            highlight: <span key={1} className={styles.highlight} />,
          }}
          values={{
            weekNumber: toLocalizedNumber(currentQuranicCalendarWeek, lang),
          }}
        />
        <br />
      </div>
      <div className={styles.subTextContainer}>
        <Trans
          i18nKey="quranic-calendar:join-qc.line-2"
          components={{
            br: <br key={0} />,
            normal: <span key={1} className={styles.normal} />,
            highlight: <span key={1} className={styles.highlight} />,
          }}
          values={{
            weekNumber: toLocalizedNumber(currentQuranicCalendarWeek, lang),
          }}
        />

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
    </div>
  );
};

export default JoinQuranicCalendarButton;

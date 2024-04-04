import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import CompletedTick from '@/components/Course/CompletedTick';
import Button, { ButtonShape, ButtonType } from '@/dls/Button/Button';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { isLoggedIn } from '@/utils/auth/login';
import { followUser, isUserFollowed } from '@/utils/auth/qf/api';
import { logButtonClick } from '@/utils/eventLogger';
import { getLoginNavigationUrl, getQuranicCalendarNavigationUrl } from '@/utils/navigation';

const QC_USERNAME = 'dbc';

const JoinQuranicCalendarButton = () => {
  const { t } = useTranslation('quranic-calendar');
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
    <Button
      isLoading={isLoading}
      isDisabled={hasJoined || hasError}
      onClick={onClick}
      type={ButtonType.Success}
      shape={ButtonShape.Pill}
    >
      {hasJoined ? (
        <>
          <CompletedTick /> {t('joined-quranic-calendar')}
        </>
      ) : (
        t('join-quranic-calendar')
      )}
    </Button>
  );
};

export default JoinQuranicCalendarButton;

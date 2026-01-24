/* eslint-disable react/no-unescaped-entities */
/* eslint-disable i18next/no-literal-string */
import { useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonVariant } from '@/dls/Button/Button';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useRamadanChallengeStatus from '@/hooks/useRamadanChallengeStatus';
import styles from '@/pages/contentPage.module.scss';
import { enrollInRamadanChallenge } from '@/utils/auth/api';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { getLoginNavigationUrl } from '@/utils/navigation';

interface Props {
  section: string;
}

const EnrollButton = ({ section }: Props) => {
  const { isEnrolled, mutate } = useRamadanChallengeStatus();
  const { t } = useTranslation('ramadan-activities');
  const router = useRouter();
  const toast = useToast();
  const [isEnrollLoading, setIsEnrollLoading] = useState(false);

  const onButtonClicked = () => {
    logButtonClick(`ramadan_challenge_${section}`);
  };

  const handleEnroll = async () => {
    onButtonClicked();

    if (!isLoggedIn()) {
      router.push(getLoginNavigationUrl(router.asPath));
      return;
    }

    if (isEnrolled) {
      return;
    }

    setIsEnrollLoading(true);
    try {
      await enrollInRamadanChallenge();
      await mutate();
      toast(t('enroll-success'), {
        status: ToastStatus.Success,
      });
    } catch (error) {
      toast(t('enroll-error'), { status: ToastStatus.Error });
    } finally {
      setIsEnrollLoading(false);
    }
  };

  const getButtonText = () => {
    if (isEnrollLoading) return t('loading');
    if (isEnrolled) return t('enrolled');
    return t('join-challenge');
  };

  if (!isLoggedIn()) {
    return (
      <Button
        href={getLoginNavigationUrl(router.asPath)}
        variant={ButtonVariant.Shadow}
        className={styles.button}
        isLoading={isEnrollLoading}
        isDisabled={isEnrolled}
      >
        {getButtonText()}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleEnroll}
      variant={isEnrolled ? ButtonVariant.Ghost : ButtonVariant.Shadow}
      className={styles.button}
      isLoading={isEnrollLoading}
      isDisabled={isEnrolled}
      aria-label={isEnrolled ? t('enrolled') : t('join-challenge')}
      aria-live="polite"
    >
      {getButtonText()}
    </Button>
  );
};

export default EnrollButton;

/* eslint-disable react/no-unescaped-entities */
/* eslint-disable i18next/no-literal-string */
import { useState } from 'react';

import { useRouter } from 'next/router';
import useSWR from 'swr';

import Button, { ButtonVariant } from '@/dls/Button/Button';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import styles from '@/pages/contentPage.module.scss';
import { enrollInRamadanChallenge, getRamadanChallengeStatus } from '@/utils/auth/api';
import { makeRamadanChallengeStatusUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { getLoginNavigationUrl } from '@/utils/navigation';

type Props = {
  section: string;
};

const EnrollButton = ({ section }: Props) => {
  const router = useRouter();
  const toast = useToast();
  const [isEnrollLoading, setIsEnrollLoading] = useState(false);

  const { data: statusData, mutate } = useSWR(
    isLoggedIn() ? makeRamadanChallengeStatusUrl() : null,
    getRamadanChallengeStatus,
  );

  const isEnrolled = statusData?.data?.isEnrolled;

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
      toast('Enrolled successfully! You may see welcome email in your inbox.', {
        status: ToastStatus.Success,
      });
    } catch (error) {
      toast('Failed to enroll, please try again later.', { status: ToastStatus.Error });
    } finally {
      setIsEnrollLoading(false);
    }
  };

  const getButtonText = () => {
    if (isEnrollLoading) return 'Loading...';
    if (isEnrolled) return 'Enrolled';
    return 'Join the Surah Al-Mulk Challenge';
  };

  return (
    <Button
      onClick={handleEnroll}
      variant={isEnrolled ? ButtonVariant.Ghost : ButtonVariant.Shadow}
      className={styles.button}
      isLoading={isEnrollLoading}
      isDisabled={isEnrolled}
    >
      {getButtonText()}
    </Button>
  );
};

export default EnrollButton;

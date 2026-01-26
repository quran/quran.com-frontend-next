/* eslint-disable react/no-unescaped-entities */
/* eslint-disable i18next/no-literal-string */
import { useState } from 'react';

import { useRouter } from 'next/router';

import Button, { ButtonVariant } from '@/dls/Button/Button';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useRamadanChallengeStatus from '@/hooks/useGetRamadanChallengeStatus';
import { logErrorToSentry } from '@/lib/sentry';
import styles from '@/pages/contentPage.module.scss';
import { addReadingGoal } from '@/utils/auth/api';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { getLoginNavigationUrl } from '@/utils/navigation';
import { GoalCategory } from 'types/auth/Goal';

interface Props {
  section: string;
}

const EnrollButton = ({ section }: Props) => {
  const { isEnrolled, mutate } = useRamadanChallengeStatus();
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
      await addReadingGoal({ category: GoalCategory.RAMADAN_CHALLENGE });
      await mutate();
      toast('Enrolled successfully! You may see a welcome email in your inbox.', {
        status: ToastStatus.Success,
      });
    } catch (error) {
      logErrorToSentry(error, {
        transactionName: 'ramadan_challenge_enroll',
        metadata: { section },
      });
      toast('Failed to enroll, please try again later.', { status: ToastStatus.Error });
    } finally {
      setIsEnrollLoading(false);
    }
  };

  const getButtonText = () => {
    if (isEnrollLoading) return 'Loading...';
    if (isEnrolled) return 'Subscribed!';
    return 'Join the Surah Al-Mulk Challenge';
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
      aria-label={isEnrolled ? 'Subscribed!' : 'Join the Surah Al-Mulk Challenge'}
      aria-live="polite"
    >
      {getButtonText()}
    </Button>
  );
};

export default EnrollButton;

/* eslint-disable react/no-unescaped-entities */
/* eslint-disable i18next/no-literal-string */
import { useState } from 'react';

import Button, { ButtonVariant } from '@/dls/Button/Button';
import Spinner from '@/dls/Spinner/Spinner';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useRamadanChallengeStatus from '@/hooks/useGetRamadanChallengeStatus';
import { logErrorToSentry } from '@/lib/sentry';
import { TestId } from '@/tests/test-ids';
import { addReadingGoal } from '@/utils/auth/api';
import { logButtonClick } from '@/utils/eventLogger';
import { GoalCategory } from 'types/auth/Goal';

interface Props {
  section: string;
  subscribedText: string;
  enrollText: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const EnrollButton = ({ section, subscribedText, enrollText }: Props) => {
  const { isEnrolled, isLoading, mutate } = useRamadanChallengeStatus();
  const [isEnrollLoading, setIsEnrollLoading] = useState(false);
  const toast = useToast();

  const isDisabled = isEnrolled || isEnrollLoading || isLoading;

  const handleEnroll = async () => {
    setIsEnrollLoading(true);
    logButtonClick(`ramadan_challenge_enroll_${section}`);
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

  if (isLoading) {
    return <Spinner dataTestId={TestId.RAMADAN_CHALLENGE_ENROLL_BUTTON_SPINNER} />;
  }

  return (
    <Button
      onClick={handleEnroll}
      variant={isDisabled ? ButtonVariant.Ghost : ButtonVariant.Shadow}
      isLoading={isEnrollLoading}
      isDisabled={isDisabled}
      aria-live="polite"
    >
      {isDisabled ? subscribedText : enrollText}
    </Button>
  );
};

export default EnrollButton;

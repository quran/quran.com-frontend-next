import { useRouter } from 'next/router';

import { HeadlessServiceProvider } from '../Notifications/hooks/useHeadlessService';

import styles from './EnrollButton.module.scss';
import EnrollButtonNotification from './EnrollButtonNotification';

import Button, { ButtonVariant } from '@/dls/Button/Button';
import Spinner from '@/dls/Spinner/Spinner';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import useRamadanChallengeStatus from '@/hooks/useGetRamadanChallengeStatus';
import { TestId } from '@/tests/test-ids';
import { logButtonClick } from '@/utils/eventLogger';
import { getLoginNavigationUrl } from '@/utils/navigation';

interface Props {
  section: string;
}

const SUBSCRIBED_TEXT = 'Subscribed!';
const ENROLL_TEXT = 'Join the Surah Al-Mulk Challenge';

const UnauthEnrollButton = ({ section }: Props) => {
  const router = useRouter();
  const { isLoggedIn } = useIsLoggedIn();
  const { isLoading, isEnrolled, mutate } = useRamadanChallengeStatus();

  const onButtonClicked = () => {
    logButtonClick(`guest_ramadan_challenge_${section}`);
  };

  if (isLoading) {
    return <Spinner dataTestId={TestId.RAMADAN_CHALLENGE_GUEST_USER_BUTTON_SPINNER} />;
  }

  if (isLoggedIn) {
    return (
      <HeadlessServiceProvider>
        <EnrollButtonNotification
          isEnrolled={isEnrolled}
          isLoading={isLoading}
          mutate={mutate}
          section={section}
          subscribedText={SUBSCRIBED_TEXT}
          enrollText={ENROLL_TEXT}
        />
      </HeadlessServiceProvider>
    );
  }

  return (
    <Button
      onClick={onButtonClicked}
      href={getLoginNavigationUrl(router.asPath)}
      variant={ButtonVariant.Shadow}
      isLoading={isLoading}
      className={styles.button}
    >
      {ENROLL_TEXT}
    </Button>
  );
};

export default UnauthEnrollButton;

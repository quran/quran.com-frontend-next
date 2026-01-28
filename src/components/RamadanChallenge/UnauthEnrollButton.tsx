import { useRouter } from 'next/router';

import { HeadlessServiceProvider } from '../Notifications/hooks/useHeadlessService';

import EnrollButton from './EnrollButton';

import Button, { ButtonVariant } from '@/dls/Button/Button';
import Spinner from '@/dls/Spinner/Spinner';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import useRamadanChallengeStatus from '@/hooks/useGetRamadanChallengeStatus';
import { logButtonClick } from '@/utils/eventLogger';
import { getLoginNavigationUrl } from '@/utils/navigation';

interface Props {
  section: string;
}

const SUBSCRIBE_TEXT = 'Join the Surah Al-Mulk Challenge';

const UnauthEnrollButton = ({ section }: Props) => {
  const router = useRouter();
  const { isLoggedIn } = useIsLoggedIn();
  const { isEnrolled, mutate, isLoading } = useRamadanChallengeStatus();

  const onButtonClicked = () => {
    logButtonClick(`guest_ramadan_challenge_${section}`);
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (isLoggedIn) {
    return (
      <HeadlessServiceProvider>
        <EnrollButton
          section={section}
          isEnrolled={isEnrolled}
          mutate={async () => {
            await mutate();
          }}
          isLoading={isLoading}
          ctaText={SUBSCRIBE_TEXT}
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
    >
      {SUBSCRIBE_TEXT}
    </Button>
  );
};

export default UnauthEnrollButton;

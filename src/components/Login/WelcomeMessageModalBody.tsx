/* eslint-disable i18next/no-literal-string */
import { useSWRConfig } from 'swr';

import MoonIllustrationSVG from '../../../public/images/moon-illustration.svg';
import Button from '../dls/Button/Button';
import Carousel from '../dls/Carousel/Carousel';
import Link, { LinkVariant } from '../dls/Link/Link';

import styles from './WelcomeMessageModalBody.module.scss';

import { completeOnboarding } from 'src/utils/auth/api';
import { makeUserProfileUrl } from 'src/utils/auth/apiPaths';
import UserProfile from 'types/auth/UserProfile';

const WelcomeMessageModalBody = () => {
  const { mutate, cache } = useSWRConfig();
  const handleFinishOnboarding = async () => {
    await completeOnboarding();
    const userProfileData = cache.get(makeUserProfileUrl());
    const newUserProfileData: UserProfile = {
      ...userProfileData,
      isOnboarded: true,
    };
    mutate(makeUserProfileUrl(), newUserProfileData);
  };

  // Welcome to Quran.com beta

  const content = (
    <div>
      <div className={styles.illustrationContainer}>
        <MoonIllustrationSVG />
      </div>
      <h2 className={styles.title}>Welcome to Quran.com Beta</h2>
      <div className={styles.description}>
        <p>
          Thank you for helping us improve Quran.com. We are looking forward to your feedback and
          bug report at{' '}
          <Link href="https://feedback.quran.com" variant={LinkVariant.Blend}>
            feedback.quran.com
          </Link>
        </p>
        <p className={styles.warning}>
          Please note that this is a beta version. Your data might be deleted when the feature is
          released to Production
        </p>
      </div>
      <div className={styles.actionContainer}>
        <Button onClick={handleFinishOnboarding}>Okay, got it</Button>
      </div>
    </div>
  );

  // TODO: localize texts
  return (
    <div className={styles.container}>
      <Carousel
        items={[
          {
            id: 'welcome',
            component: content,
          },
          {
            id: 'bug',
            component: content,
          },
        ]}
      />
    </div>
  );
};

export default WelcomeMessageModalBody;

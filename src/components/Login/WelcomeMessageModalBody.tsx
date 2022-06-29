/* eslint-disable i18next/no-literal-string */

import MoonIllustrationSVG from '../../../public/images/moon-illustration.svg';
import Button from '../dls/Button/Button';
import Carousel from '../dls/Carousel/Carousel';
import Link, { LinkVariant } from '../dls/Link/Link';

import styles from './WelcomeMessageModalBody.module.scss';

type WelcomeMessageModalBodyProps = {
  onCompleted: () => void;
};
const WelcomeMessageModalBody = ({ onCompleted }: WelcomeMessageModalBodyProps) => {
  // TODO: localize texts
  const slide1 = (
    <div>
      <div className={styles.illustrationContainer}>
        <MoonIllustrationSVG />
      </div>
      <h2 className={styles.title}>
        Welcome to Quran.com <br />
        User Account Beta
      </h2>
      <div className={styles.actionContainer}>
        <Button href="#announcement-slide-2">{`See what's new`}</Button>
      </div>
    </div>
  );

  const slide2 = (
    <div className={styles.slideContainer}>
      <h2 className={styles.title}>
        Your data will be synced <br />
        across devices
      </h2>
      <div className={styles.description}>
        <p>
          Whether you’re using Quran.com on your phone or your laptop, your bookmarks, last read
          verses, and your preferences will be available
        </p>
      </div>
      <div className={styles.actionContainer}>
        <Button href="#announcement-slide-3">Next</Button>
      </div>
    </div>
  );

  const slide3 = (
    <div className={styles.slideContainer}>
      <h2 className={styles.title}>We wanna hear your thoughts</h2>
      <div className={styles.description}>
        <p>
          Thank you for using Quran.com and we would be glad to hear your feedback on{' '}
          <Link href="https://feedback.quran.com" variant={LinkVariant.Blend}>
            feedback.quran.com
          </Link>
        </p>
        <p className={styles.warning}>
          <small>
            NOTE: This is a beta feature <br /> We might have to reset your account data before
            going Live.
          </small>
        </p>
      </div>
      <div className={styles.actionContainer}>
        <Button href="#announcement-slide-3" onClick={onCompleted}>
          Okay, got it
        </Button>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <Carousel
        items={[
          {
            id: 'announcement-slide-1',
            component: slide1,
          },
          {
            id: 'announcement-slide-2',
            component: slide2,
          },
          {
            id: 'announcement-slide-3',
            component: slide3,
          },
        ]}
      />
    </div>
  );
};

export default WelcomeMessageModalBody;

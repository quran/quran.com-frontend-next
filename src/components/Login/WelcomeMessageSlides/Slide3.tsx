import Trans from 'next-translate/Trans';

import styles from '../WelcomeMessageModalBody.module.scss';

import Link, { LinkVariant } from '@/dls/Link/Link';

const Slide3 = ({ action }) => {
  return (
    <div className={styles.slideContainer}>
      <h2 className={styles.title}>
        <Trans
          components={{ br: <br /> }}
          i18nKey="common:announcements.auth-onboarding.slide-3.title"
        />
      </h2>
      <div className={styles.description}>
        <p>
          <Trans
            components={{
              link: <Link href="https://feedback.quran.com" variant={LinkVariant.Blend} />,
            }}
            i18nKey="common:announcements.auth-onboarding.slide-3.description"
          />
        </p>
      </div>
      <div className={styles.actionContainer}>{action}</div>
    </div>
  );
};

export default Slide3;

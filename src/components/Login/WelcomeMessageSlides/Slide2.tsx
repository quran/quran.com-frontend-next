import Trans from 'next-translate/Trans';

import styles from '../WelcomeMessageModalBody.module.scss';

const Slide2 = ({ action }) => {
  return (
    <div className={styles.slideContainer}>
      <h2 className={styles.title}>
        <Trans
          components={{ br: <br /> }}
          i18nKey="common:announcements.auth-onboarding.slide-2.title"
        />
      </h2>
      <div className={styles.description}>
        <p>
          <Trans
            components={{ br: <br /> }}
            i18nKey="common:announcements.auth-onboarding.slide-2.description"
          />
        </p>
      </div>
      <div className={styles.actionContainer}>{action}</div>
    </div>
  );
};

export default Slide2;

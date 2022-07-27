import Trans from 'next-translate/Trans';

import styles from '../WelcomeMessageModalBody.module.scss';

import Moon from 'src/components/Icons/Moon/Moon';

const Slide1 = ({ action }) => {
  return (
    <div>
      <div className={styles.illustrationContainer}>
        <Moon />
      </div>
      <h2 className={styles.title}>
        <Trans
          components={{ br: <br /> }}
          i18nKey="common:announcements.auth-onboarding.slide-1.title"
        />
      </h2>
      <div className={styles.actionContainer}>{action}</div>
    </div>
  );
};

export default Slide1;
